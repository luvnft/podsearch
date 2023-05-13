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
import asyncio

def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)

async def main():
    prisma = Prisma()
    await prisma.connect()
    
    filename = None
    audioFile = None
    
    episodes = await prisma.episode.find_many(
        where={
            "isTranscribed": True
        }
    )
    
    for episode in episodes:
        print("Getting segments...")
        segments = await prisma.segment.find_many(
            where = {
                "belongsToEpisodeGuid": episode.episodeGuid
            }
        )
        
        segments = [dict(segment) for segment in segments]
        for segment in segments:
            segment["text"] = segment["text"].strip()
        
        # Delete any file that begins with audio. in the folder 
        for file in os.listdir(): 
            if file.startswith('audio.'): 
                print("Deleted last audio.-file")
                os.remove(file)
                
        print("Realigning: ", episode.episodeTitle)
        try:
            audioFile = requests.get(episode.episodeEnclosure)
        except Exception as e:
            print("Failed download, continuing")
            continue
        
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
            continue
        model_a, metadata = whisperx.load_align_model(language_code="en", device="cuda", model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-english")
        result_aligned = whisperx.align(segments, model_a, metadata, filename, "cuda")
        df = pd.DataFrame(result_aligned["segments"])
        jsonData = json.loads(df.to_json(orient = "records"))
        with open("json.json", "wt") as f:
            f.write(json.dumps(jsonData))
            
if __name__ == "__main__":
    asyncio.run(main())