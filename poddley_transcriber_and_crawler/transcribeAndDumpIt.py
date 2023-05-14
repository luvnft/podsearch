import mimetypes
import requests
import os
from prisma import Prisma
from prisma.models import Transcription, Segment
import json
import re
import insertJsonFilesToDb
import time
import whisperx
import pandas as pd
import subprocess

def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)

async def transcribeAndDumpIt(episode, model):
    prisma = Prisma()
    await prisma.connect()
    
    # Loop over the rows of episodes gathered
    episode = dict(episode)
    url = episode["episodeEnclosure"]
    audioFile = None
    transcriptionData = None
    extension = None
    content_type = None
    
    print("Doing the episode:", url)
    
    # Delete any file that begins with audio. in the folder 
    for file in os.listdir(): 
        if file.startswith('audio.'): 
            print("Deleted last audio.-file")
            os.remove(file)
            
    try:
        audioFile = requests.get(url)
    except Exception as e:
        return
        
    try:
        content_type = audioFile.headers['content-type']
        extension = mimetypes.guess_extension(content_type)
    except Exception as e:
        print("Probably this error: ", e)
        
    if "video" in content_type:
        # Convert the video to audio using ffmpeg
        audio_filename = "audio.wav"  # You can choose your desired audio format
        convert_video_to_audio_ffmpeg(filename, audio_filename)

        # Replace the original filename with the audio filename
        filename = audio_filename
    else:
        filename = "audio" + extension
    
    # Save the file as the file
    with open(filename, 'wb') as f:
        f.write(audioFile.content)
        
    # If no extension, fuck it.
    if extension == None:
        return
                
    # Transcribe it bitch
    print("The title of the episode is:", episode["episodeTitle"])
    print("Transcribing url:", url)
    print("The file name is:", filename)
    try:
        transcriptionData = {}
        segments = None
        startTime = time.time()
        # transcriptionData = model.transcribe(filename, language="en")
        segments, _ = model.transcribe(filename, beam_size=5, language="en")
        segments = list(segments)  # The transcription will actually run here.
        segments = [segment._asdict() for segment in segments]
        model_a, metadata = whisperx.load_align_model(language_code="en", device="cuda", model_name="jonatasgrosman/wav2vec2-large-xlsr-53-english")
        result_aligned = whisperx.align(segments, model_a, metadata, filename, "cuda")
        df = pd.DataFrame(result_aligned["segments"])
        jsonData = json.loads(df.to_json(orient = "records"))
        endTime = time.time()
        elapsedTime = endTime - startTime
        print("Time elapsed in seconds: ", elapsedTime)
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

    print("------Inserting json files--------")
    
    await insertJsonFilesToDb.insertJsonFilesToDb(episode)