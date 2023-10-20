import mimetypes
import requests
import os
import json
import re
import time
import pandas as pd
import subprocess
import whisperx
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import spacy
from audioOffsetFinder import find_offset_between_files
from pytube import YouTube
from moviepy.editor import *
from ytpy import YoutubeClient
import aiohttp

app = FastAPI()

class TranscribeData(BaseModel):
    episodeLink: str
    episodeTitle: str
    episodeGuid: str
    podcastGuid: str
    language: str

# Vars
batch_size = 16  # reduce if low on GPU mem
model_size = "large-v2"
device = "cuda"
compute_type = "float16" # change to "int8" if low on GPU mem (may reduce accuracy)

# 1. Transcribe with original whisper (batched)
model = whisperx.load_model(model_size, device, compute_type=compute_type)
nlp = spacy.load('en_core_web_sm')

def getSimilarityScore(text1, text2):
    # The texts to compare
    text1 = sys.argv[1]
    text2 = sys.argv[2]

    # Process the texts
    doc1 = nlp(text1)
    doc2 = nlp(text2)

    # Get the similarity between the two texts
    similarity = doc1.similarity(doc2)
    
    return similarity
    
    
def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    print("Converting the video file to audio file")
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)
    print("Finished converting video file to audio file")

async def download_and_convert_to_wav(youtube_link, output_path):
    # Download the video
    yt = YouTube(youtube_link)
    stream = await yt.streams.filter(progressive=True, file_extension='mp4').first()
    video_file_path = await stream.download(output_path)

    # Convert the video to WAV format
    audio_file_path = video_file_path.replace('.mp4', '.wav')
    video = VideoFileClip(video_file_path)
    video.audio.write_audiofile(audio_file_path, codec='pcm_s16le')

    return audio_file_path

async def transcribeAndSaveJson(episodeLink, episodeTitle, episodeGuid, podcastGuid, language, batch_size, device):
    audioFileName = os.path.join(os.getcwd(), "audio.wav")

    # Delete any file that begins with 'audio' in the folder to avoid retranscribing
    for file in os.listdir():
        if file.startswith("audio.wav"):
            print("Deleted the last 'audio' prefixed file")
            os.remove(file)

    # Download the podcast
    try:
        audioFile = requests.get(episodeLink)
    except Exception as e:
        print(f"Error downloading the file: {e}")
        return None

    # Determine the content type based on the headers from the response
    try:
        content_type = audioFile.headers["content-type"]
        extension = mimetypes.guess_extension(content_type)
    except Exception as e:
        print("Error determining content type:", e)
        return None

    # If there's no extension, exit the function
    if not extension:
        print("No extension found, exiting.")
        return None

    # If it's a video, we need to convert it to audio first
    if "video" in content_type:
        video_filename = (
            "temp_video_file"  # You can modify this to fit a suitable naming convention
        )
        audio_filename = "audio.wav"

        with open(video_filename, "wb") as f:
            f.write(audioFile.content)

        # Convert video to audio
        print("Converting video file to audio file")
        convert_video_to_audio_ffmpeg(video_filename, audio_filename)

        # Delete the temporary video file
        print("Printing the temp video file")
        os.remove(video_filename)

    # It's not a video just save the audiofile
    else:
        # Name of the audioFileName
        print(os.getcwd())

        # Save the audio file
        with open(audioFileName, "wb") as f:
            f.write(audioFile.content)

    # Transcribe the downloaded episode
    print("Transcribing the episode with title:", episodeTitle)

    try:
        startTime = time.time()
        transcriptionData = {}
        segments = None

        # Loading audio
        print("Loading audio")
        print("The audioFileName is: ", audioFileName);
        audio = whisperx.load_audio(audioFileName)

        # Transcribing...
        print("Transcribing ...", episodeTitle,
              "the link to the audioFile is: ", episodeLink)
        result = model.transcribe(audio, batch_size=batch_size)
        segments = result["segments"]

        # Define a minimum duration (in seconds)
        min_duration = 0.1

        # Filter out too short segments as they're useless
        filtered_segments = [
            s for s in segments if s["end"] - s["start"] > min_duration
        ]

        # If no segments left after filtering, skip this episode
        if not filtered_segments:
            print(
                f"No segments longer than {min_duration}s in episode {episodeTitle}, skipping."
            )
            return

        # Replace the original segments list with the filtered one
        segments = filtered_segments

        # Load the model alignment model
        model_a, metadata = whisperx.load_align_model(
            language_code="en",
            device=device,
            model_name="jonatasgrosman/wav2vec2-large-xlsr-53-english",
        )

        # Aligning the segments in accordance to the audio now
        print("Aligning the segments in accordance to the audio now")
        result_aligned = whisperx.align(
            segments,
            model_a,
            metadata,
            audioFileName,
            device=device,
            return_char_alignments=False,
        )
        print("Time elapsed in seconds: ", time.time() - startTime)

        # Save it
        transcriptionData["segments"] = result_aligned["segments"]

        # If no transcriptionData, fuck it
        if transcriptionData == None:
            return None

        # Get all necessary data from the episode(which is the row right)
        print("Setting segments")
        segments = transcriptionData["segments"]
        belongsToPodcastGuid = podcastGuid
        belongsToEpisodeGuid = episodeGuid
        text = "".join([segment["text"] for segment in segments])

        # Add the keys to the transcriptionData object too
        transcriptionData["belongsToPodcastGuid"] = belongsToPodcastGuid
        transcriptionData["belongsToEpisodeGuid"] = belongsToEpisodeGuid
        transcriptionData["text"] = text
        transcriptionData["language"] = language
        
        # Find the youtube link associated with the episodeTitle
        print("Preparing to download the youtubeLink")
        session = aiohttp.ClientSession()
        client = YoutubeClient(session)
        response = await client.search(episodeTitle)
        await session.close()
        maxScore = 0
        bestLinkId = ""

        for res in response:
            score = getSimilarityScore(episodeTitle, res["title"])
            if score > maxScore and score > 0.7:
                maxScore = score
                bestLinkId = res["id"]
        if bestLinkId != "":
            transcriptionData["youtubeVideoLink"] = f"https://www.youtube.com/watch?v=${bestLinkId}"
            
        results = {}
        if transcriptionData["youtubeVideoLink"] != "":
            # Download the youtube video
            print("Download youtube video and converting it to audio.")
            await download_and_convert_to_wav(transcriptionData["youtubeVideoLink"], "videoAudio.wav")
            print("Done downloading and converting it to audio.")
            
            # Then find offset
            results = find_offset_between_files("audio.wav", "videoAudio.wav", trim=2000)
        
        # Set the offset the offset
        if results["time_offset"]:
            transcriptionData["deviationTime"] = results["time_offset"]
        else:
            transcriptionData["deviationTime"] = 0
        
        # Save the transcriptionDataObject as a JSON
        transcriptionFileName = belongsToEpisodeGuid + ".json"

        # Clean up the name so it can be saved without issues
        transcriptionFileName = re.sub(
            r"[^A-Za-z0-9.-]", "", transcriptionFileName)
        print("Saving transcriptionData to:", transcriptionFileName)

        try:
            with open("./" + transcriptionFileName, "w") as file:
                json.dump(transcriptionData, file, indent=4)
        except Exception as e:
            print("Error with saving transcriptionData:", e)
        
    # Error return
    except Exception as e:
        print("Error with transcribing:", e)
        return None

# Main transcriber api route
@app.post("/transcribe")
async def transcribe(data: TranscribeData):
    try:
        print("Starting transcription of :", data.episodeTitle)
        await transcribeAndSaveJson(data.episodeLink, data.episodeTitle, data.episodeGuid, data.podcastGuid, data.language, batch_size, device)
        print("Done with episode: ", data.episodeTitle, "Next!")
        
        return {"status": "True"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)