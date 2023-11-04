from prisma import Client
import os
from dotenv import load_dotenv
import yt_dlp
import asyncio
from prisma import Prisma
import whisperx
from pprint import pprint

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
    db = Prisma()
    await db.connect()

    # Get all of the episodes which have a youtubeLink
    episodes = await db.episode.find_many(
        where={"youtubeVideoLink": {"not_in": ["Null"]}}
    )

    for episode in episodes:
        print("Doing episode: ", episode.episodeTitle)

        # Fetch the segments for that episode
        segments = await db.segment.find_many(
            where={"belongsToEpisodeGuid": episode.episodeGuid}
        )

        # Prepare segments
        prepared_segments = [
            {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "id": segment.id,
            }
            for segment in segments
        ]

        # Download the youtubeAudio from the episode.youtubeLink
        download_youtube_audio(episode.youtubeVideoLink)

        # Align the segments with the youtubeAudio
        # Load the model alignment model
        model_a, metadata = whisperx.load_align_model(
            language_code=episode.episodeLanguage,
            device="cuda",
        )
        print("Aligning the segments with the youtubeAudioFile")
        # Assuming whisperx is a module or library you have
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
        for index, segment in enumerate(prepared_segments):
            segment["startYoutube"] = alignedSegments[index]["start"]
            segment["endYoutube"] = alignedSegments[index]["end"]

        # I'm not sure why the original array is being mutated, but regardless need to remove some stuff from it .
        finishedSegments = [
            {
                "start": prepared_segment["start"],
                "end": prepared_segment["end"],
                "text": prepared_segment["text"],
                "startYoutube": prepared_segment["startYoutube"],
                "endYoutube": prepared_segment["endYoutube"],
                "id": prepared_segment["id"],
            }
            for prepared_segment in prepared_segments
        ]

        print("finishedSegments", finishedSegments[0])

        # Updating the segments with youtube alignment
        for finishedSegment in finishedSegments:
            print(finishedSegment)
            try:
                await db.segment.update(
                    data=finishedSegment, where={"id": finishedSegment["id"]}
                )
            except Exception as e:
                print("Some error: ", e)

        print("Finished updating the segments for : ", episode.episodeTitle)

    db.disconnect()


if __name__ == "__main__":
    asyncio.run(youtube_aligner())
