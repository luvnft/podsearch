import mimetypes
import requests
import os
import json
import re
import time
import pandas as pd
import subprocess
import whisperx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from moviepy.editor import *
import re
import requests
import json

def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    print("Converting the video file to audio file")
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)
    print("Finished converting video file to audio file")

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
async def transcribe(data: TranscribeData):
    try:
        print("Starting transcription of :", data.episodeTitle)
        await transcribeAndSaveJson(
            data.episodeLink,
            data.episodeTitle,
            data.episodeGuid,
            data.podcastGuid,
            data.language,
            batch_size,
            device,
        )
        print("Done with episode: ", data.episodeTitle, "Next!")

        return {"status": "True"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
