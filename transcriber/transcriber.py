import requests
import os
import json
import time
import whisperx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import requests
import json
import yt_dlp

app = FastAPI()

class TranscribeData(BaseModel):
    episodeLink: str
    episodeTitle: str
    episodeGuid: str
    podcastGuid: str
    language: str
    episodeYoutubeLink: str
    processingYoutube: bool
    
# Vars
batch_size = 16  # reduce if low on GPU mem
model_size = "large-v2"
device = "cuda"
compute_type = "float16"

# 1. Transcribe with original whisper (batched)
model = whisperx.load_model(model_size, device, compute_type=compute_type)

def download_youtube_audio(youtube_link):
    ydl_opts = {
        "format": "bestaudio/best",
        "geo_bypass": True,
        "nocheckcertificate": True,
        "quiet": True,
        "no_warnings": True,
        "outtmpl": "./youtubeAudio.mp4",  # Set output filename to "youtubeAudio" with appropriate extension
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_link])

async def transcribeAndSaveJson(
    episodeLink,
    episodeTitle,
    episodeGuid,
    podcastGuid,
    language: str,
    batch_size,
    device,
    processingYoutube: bool,
):
    audioFileName = "audio.wav" if processingYoutube == False else "youtubeAudio.mp4"

    # Delete any file that begins with 'audio' in the folder to avoid retranscribing
    for file in os.listdir():
        if file.startswith("audio.wav"):
            print("Deleted the last 'audio' prefixed file")
            os.remove(file)
        if file.startswith("youtubeAudio.mp4"):
            print("Deleted the last 'youtubeAudio' prefixed file")
            os.remove(file)

    # Download the podcast/yottube
    try:
        if processingYoutube == False:
            print("Downloading Audio")
            audioFile = requests.get(episodeLink)
            with open(audioFileName, "wb") as f:
                f.write(audioFile.content)
        else:
            print("Download YouTube")
            download_youtube_audio(episodeLink)
    except Exception as e:
        print(f"Error downloading the file: {e}")
        return None

    # Transcribe the downloaded episode
    print("Transcribing the episode with title:", episodeTitle)

    try:
        startTime = time.time()
        transcriptionData = {}
        segments = None

        # Loading audio
        print("Loading audio")
        print("The audioFileName is: ", audioFileName)
        audio = whisperx.load_audio(audioFileName)

        # Transcribing...
        print(
            "Transcribing ...",
            episodeTitle,
            "the link to the audioFile is: ",
            episodeLink,
        )
        result = model.transcribe(audio, batch_size=batch_size, language=language)
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
            language_code=language,
            device=device,
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
        transcriptionData["processingYoutube"] = processingYoutube

        # Save the transcriptionDataObject as a JSON
        transcriptionFileName = str(int(time.time())) + ".json"

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
# Downloads the audioPodcast
# Transcribes it aligns it and saves it as a json
# Downloads the youtubeVideo
# Transcribes it aligns it and saves it as a json
async def transcribe(data: TranscribeData):
    try:
        print("Received data: ", data)
        print("🔊Starting transcription for:", data.episodeTitle)
        await transcribeAndSaveJson(
            episodeLink=data.episodeLink,
            episodeTitle=data.episodeTitle,
            episodeGuid=data.episodeGuid,
            podcastGuid=data.podcastGuid,
            language=data.language,
            batch_size=batch_size,
            device=device,
            processingYoutube=data.processingYoutube,
        )
        print("🔊Done with transcription of audio podcast for:", data.episodeTitle)
        return {"status": "True"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
