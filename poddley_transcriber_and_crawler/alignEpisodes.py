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
import copy

def convert_video_to_audio_ffmpeg(video_filename, audio_filename):
    command = f"ffmpeg -i {video_filename} -vn -acodec copy {audio_filename}"
    subprocess.call(command, shell=True)

async def main():
    prisma = Prisma()
    await prisma.connect()
    
    filename = None
    audioFile = None
    while True:
        episode = await prisma.episode.find_first(
            where={
                "isTranscribed": True,
                "reAlignedWithBigModel": False
            }
        )
            
        print("Getting segments... for: ", episode.episodeGuid)
        segments = await prisma.segment.find_many(
            where = {
                "belongsToEpisodeGuid": episode.episodeGuid
            }
        )
        
        if len(segments) == 0:
            await prisma.episode.update(
                where = {
                    "episodeGuid": episode.episodeGuid
                },
                data = {
                    "isTranscribed": False,
                    "reAlignedWithBigModel": False
                }
            )
            continue
                
        segments = [dict(segment) for segment in segments]
        segments = sorted(segments, key = lambda x: x["start"])
        
        # Define a minimum duration (in seconds)
        min_duration = 0.1

        # Filter out too short segments
        filtered_segments = [s for s in segments if s['end'] - s['start'] > min_duration]

        # If no segments left after filtering, skip this episode
        if not filtered_segments:
            print(f"No segments longer than {min_duration}s in episode {episode.episodeTitle}, skipping.")
            continue

        # Replace the original segments list with the filtered one
        segments = filtered_segments
        
        for segment in segments:
            segment["text"] = segment["text"].strip()
        
        # Delete any file that begins with audio. in the folder 
        for file in os.listdir(): 
            if file.startswith('audio.'): 
                print("Deleted last audio.-file")
                os.remove(file)
        if os.path.exists("data.sjon") == True:
            os.remove("data.json")
            
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
    
        print("Realigning: ", episode.episodeTitle, " filename: ", filename)
        model_a, metadata = whisperx.load_align_model(language_code="en", device="cuda", model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-english")
        result_aligned = whisperx.align(segments, model_a, metadata, filename, "cuda")
        df = pd.DataFrame(result_aligned["segments"])
        alignedSegments = json.loads(df.to_json(orient = "records"))
        alignedSegments = sorted(alignedSegments, key = lambda x: x["start"])
        
        for index, segment in enumerate(alignedSegments):
            splittedText = segment["text"].strip().split(" ")
            for wordSegment in segment["word-segments"]:
                wordSegment["segmentTextStartCharIndex"] = copy.deepcopy(wordSegment["segment-text-start"])
                wordSegment["segmentTextEndCharIndex"] = copy.deepcopy(wordSegment["segment-text-end"])
                wordSegment["wordIndex"] = copy.deepcopy(wordSegment["word-idx"])
                del wordSegment["segment-text-start"]
                del wordSegment["segment-text-end"]
                del wordSegment["word-idx"]

                try:
                    wordSegment["text"] = splittedText[wordSegment["wordIndex"]]
                except e as Error:
                    wordSegment["text"] = ""
            
            if "seg-text" in segment:
                del segment["seg-text"]
                    
            segments[index]["segmentWordEntries"] = copy.deepcopy(segment["word-segments"])
            
            with open('data.json', 'w', encoding='utf-8') as f:
                json.dump(segments, f, ensure_ascii=False, indent=4)
        
        # Open the file json
        data = None
        with open("data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        for segment in data:
            if "seg-text" in segment:
                del segment["seg-text"]
            del segment["Episode"]
            del segment["Podcast_belongsToPodcastGuid"]
            del segment["Transcription_belongsToTranscriptId"]
            segment["segmentWordEntries"] = json.dumps(segment["segmentWordEntries"])
            
        if data is None:
            continue
        
        # Delete all the segments that are associated with a given episodes as the segments returned from whispherX dont have a unique id and there is no way for us to know which one to update as the ids are not unique. We could e.g. find them using some sort of algorithm, but that seems like more work then necessary. THen only consequenceo f this re-alignment is that we need to re-index everything afterwards. WHich isnt a catastrophy
        await prisma.segment.delete_many(
            where = {
                "belongsToEpisodeGuid": episode.episodeGuid
            }
        )
        await prisma.segment.create_many(
            data=data,
            skip_duplicates=True
        )
        await prisma.episode.update(
            where = {
                "episodeGuid": episode.episodeGuid
            },
            data = {
                "reAlignedWithBigModel": True,
                "isTranscribed": True
            }
        )
            
if __name__ == "__main__":
    asyncio.run(main())