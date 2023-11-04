from prisma import Client
import os
from dotenv import load_dotenv
import yt_dlp
import asyncio
from prisma import Prisma
import whisperx
import json

# Load environment variables
load_dotenv("../.env")

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


async def youtube_aligner():
    # List all JSON files in the current directory
    json_files = [f for f in os.listdir('.') if f.endswith('.json')]

    for json_file in json_files:
        # Open and read the JSON file
        with open(json_file, 'r') as file:
            episode = json.loads(file.read())

        print("Doing episode: ", episode['belongsToEpisodeGuid'])

        # Prepare segments assuming segments are stored in the JSON
        prepared_segments = [
            {
                "start": segment['start'],
                "end": segment['end'],
                "text": segment['text'],
            }
            for segment in episode['segments']
        ]

        # Download the youtubeAudio from the episode.youtubeLink
        download_youtube_audio(episode["youtubeVideoLink"])
        # Align the segments with the youtubeAudio
        model_a, metadata = whisperx.load_align_model(
            language_code=episode['language'],
            device="cuda",
        )
        print("Aligning the segments with the youtubeAudioFile")
        result_aligned = whisperx.align(
            prepared_segments,
            model_a,
            metadata,
            "youtubeAudio.mp4",
            device="cuda",
            return_char_alignments=False,
            combined_progress=True,
        )

        alignedSegments = result_aligned["segments"]

        # Update the segments with the aligned values
        for index, prepared_segment in enumerate(prepared_segments):
            prepared_segment["startYoutube"] = alignedSegments[index]["start"]
            prepared_segment["endYoutube"] = alignedSegments[index]["end"]
            del prepared_segment["clean_wdx"]
            del prepared_segment["sentence_spans"]
            del prepared_segment["clean_char"]
            del prepared_segment["clean_cdx"]

        # Update the JSON file with the aligned segments
        with open(json_file, 'w') as file:
            episode['segments'] = prepared_segments
            file.write(json.dumps(episode, indent=4))

        print(f"Finished updating the segments for: {episode['belongsToEpisodeGuid']}")
    print("Finished!")

if __name__ == "__main__":
    asyncio.run(youtube_aligner())
