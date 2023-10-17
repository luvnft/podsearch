import mimetypes
import requests
import os
import json
import re
import time
import pandas as pd
import subprocess
import whisperx
import asyncio

# Vars
batch_size = 16  # reduce if low on GPU mem
model_size = "large-v2"
device = "cuda"
# change to "int8" if low on GPU mem (may reduce accuracy)
compute_type = "float16"


def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    print("Converting the video file to audio file")
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)
    print("Finished converting video file to audio file")


async def transcribeAndSaveJson(episodeLink, episodeTitle, episodeGuid, podcastGuid, language, model, batch_size, device):
    audioFileName = ""

    # Delete any file that begins with 'audio' in the folder to avoid retranscribing
    for file in os.listdir():
        if file.startswith("audio"):
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
        audioFileName = "audio.wav"

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
        audio = model.load_audio(audioFileName)

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
        model_a, metadata = model.load_align_model(
            language_code="en",
            device=device,
            model_name="jonatasgrosman/wav2vec2-large-xlsr-53-english",
        )

        # Aligning the segments in accordance to the audio now
        print("Aligning the segments in accordance to the audio now")
        result_aligned = model.align(
            segments,
            model_a,
            metadata,
            audioFileName,
            device=device,
            return_char_alignments=False,
        )
        # df = pd.DataFrame(result_aligned["segments"])
        # jsonData = json.loads(df.to_json(orient="records"))
        print("Time elapsed in seconds: ", time.time() - startTime)

        # Save it
        transcriptionData["segments"] = result_aligned["segments"]

    # Error return
    except Exception as e:
        print("Error with transcribing:", e)
        return None

    # If no transcriptionData, fuck it
    if transcriptionData == None:
        return None

    # Get all necessary data from the episode(which is the row right)
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

# Main transcriber function
# We will rather pass the the url with some other info to the python function directly and do the locking inside with javascript as its more concice and allows us to lock in a better manner and that way we can also avoid having the extra prisma file here as well and we can avoid having the env file in two different places.
async def main(episodeLink, episodeTitle, episodeGuid, podcastGuid, language):
    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model(model_size, device, compute_type=compute_type)

    # Transcribe
    print("Transcribing:", episodeTitle)
    
    # It just saves the transcriptionFile as a .json
    await transcribeAndSaveJson(episodeLink, episodeTitle, episodeGuid, podcastGuid, language, model, batch_size, device)
    print("Done with episode: ", episodeTitle, "Next!")


# Run the transcriber
if __name__ == "__main__":
    asyncio.run(main())
