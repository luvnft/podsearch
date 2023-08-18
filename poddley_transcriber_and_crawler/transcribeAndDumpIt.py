import mimetypes
import requests
import os
import json
import re
import insertJsonFilesToDb
import time
import pandas as pd
import subprocess

batch_size = 16 # reduce if low on GPU mem

def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)

async def transcribeAndDumpIt(episode, model):
    # Convert episode to dictionary
    episode = dict(episode)
    url = episode["episodeEnclosure"]
    audioFileName = ""

    print("Processing the episode with mp3-url:", url)
    
    # Delete any file that begins with 'audio' in the folder to avoid retranscribing
    for file in os.listdir():
        if file.startswith('audio'):
            print("Deleted the last 'audio' prefixed file")
            os.remove(file)
    
    # Download the podcast
    try:
        audioFile = requests.get(url)
    except Exception as e:
        print(f"Error downloading the file: {e}")
        return
    
    # Determine the content type based on the headers from the response
    try:
        content_type = audioFile.headers['content-type']
        extension = mimetypes.guess_extension(content_type)
    except Exception as e:
        print("Error determining content type:", e)
        
    # If it's a video, we need to convert it to audio first
    if "video" in content_type:
        video_filename = "temp_video_file"  # You can modify this to fit a suitable naming convention
        audio_filename = "audio.wav"
        
        with open(video_filename, 'wb') as f:
            f.write(audioFile.content)

        # Convert video to audio
        convert_video_to_audio_ffmpeg(video_filename, audio_filename)

        # Optionally, delete the temporary video file
        os.remove(video_filename)
    else:
        audioFileName = "audio.wav"

        # Save the audio file
        with open(audioFileName, 'wb') as f:
            f.write(audioFile.content)
        
    # If there's no extension, exit the function
    if not extension:
        print("No extension found, exiting.")
        return
                
    # Transcribe the episode
    print("Transcribing the episode with title:", episode["episodeTitle"])

    try:
        transcriptionData = {}
        segments = None
        startTime = time.time()
        
        # Loading audio
        print("Loading audio")
        audio = model.load_audio(audioFileName)

        # Transcribing...
        print("Transcribing started...")
        result = model.transcribe(audio, batch_size=batch_size)

        # Define a minimum duration (in seconds)
        min_duration = 0.1

        # Filter out too short segments
        filtered_segments = [s for s in segments if s['end'] - s['start'] > min_duration]

        # If no segments left after filtering, skip this episode
        if not filtered_segments:
            print(f"No segments longer than {min_duration}s in episode {episode.episodeTitle}, skipping.")
            return

        # Replace the original segments list with the filtered one
        segments = filtered_segments

        model_a, metadata = model.load_align_model(language_code="en", device="cuda", model_name="jonatasgrosman/wav2vec2-large-xlsr-53-english")
        result_aligned = model.align(segments, model_a, metadata, audioFileName, "cuda")
        df = pd.DataFrame(result_aligned["segments"])
        jsonData = json.loads(df.to_json(orient = "records"))
        print("Time elapsed in seconds: ", time.time() - startTime)
        
        # Save it
        transcriptionData["segments"] = jsonData
        
    except Exception as e:
        print("Error with transcribing:", e)
    
    # If no transcriptionData, fuck it
    if transcriptionData == None: 
        return
                            
    # Get all necessary data from the episode(which is the row right)
    segments = transcriptionData["segments"]
    belongsToPodcastGuid = episode["podcastGuid"]
    belongsToEpisodeGuid = episode["episodeGuid"]
    text = "".join([segment["text"] for segment in segments])
    language = "en"
    
    # Add the keys to the transcriptionData object too  
    transcriptionData["belongsToPodcastGuid"] = belongsToPodcastGuid
    transcriptionData["belongsToEpisodeGuid"] = belongsToEpisodeGuid
    transcriptionData["text"] = text
    transcriptionData["language"] = language

    # Save the transcriptionDataObject as a JSON
    transcriptionFileName = belongsToEpisodeGuid + ".json"
    
    # Clean up the name so it can be saved without issues
    transcriptionFileName = re.sub(r'[^A-Za-z0-9.-]', '', transcriptionFileName)
    print("Saving transcriptionData to:", transcriptionFileName)

    # Save the transcriptionDataObject as a JSON to /jsons folder
    if os.path.exists("./jsons/") == False:
        os.mkdir("./jsons/")
        
    try:
        with open("./jsons/" + transcriptionFileName, 'w') as file:
            json.dump(transcriptionData, file, indent=4)
    except Exception as e:
        print("Error with saving transcriptionData:", e)

    print("<<<------Inserting json files-------->>>")
    
    await insertJsonFilesToDb.insertJsonFilesToDb(episode)