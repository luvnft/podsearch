import json
import pandas as pd
import subprocess
import asyncio
import spacy
from audioOffsetFinder import find_offset_between_files
from pytube import YouTube
from moviepy.editor import *
from youtubesearchpython import SearchVideos
import sys

nlp = spacy.load("en_core_web_sm")


async def find_youtube_link(episodeTitle, getSimilarityScore):
    # Search YouTube for the given episode title
    search = SearchVideos(episodeTitle, mode="json", max_results=5)
    result = search.result()

    try:
        search_results = json.loads(result)["search_result"]

        # Get similarity scores for each title
        scores = []
        for video_info in search_results:
            title = video_info["title"]
            score = getSimilarityScore(episodeTitle, title)
            scores.append((score, video_info["link"]))

        # Sort by highest similarity score
        scores.sort(reverse=True, key=lambda x: x[0])

        bestLink = scores[0][1]
        if "youtube.com" not in bestLink:
            bestLink = f"https://www.youtube.com/watch?v={bestLink}"
        print("BestLink:", bestLink)
        return bestLink

    except (IndexError, KeyError, json.JSONDecodeError):
        print("Video not found!")
        return None


def getSimilarityScore(text1, text2):
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


def download_and_convert_to_wav(youtube_link):
    audio_file_path = ""
    try:
        print("youtube_link", youtube_link)
        # Download the video
        yt = YouTube(youtube_link, use_oauth=True, allow_oauth_cache=True)
        print("YouTube began")
        stream = yt.streams.filter(progressive=True, file_extension="mp4").first()
        print("stream began")
        video_file_path = stream.download(filename="videoAudio.mp4")
        print("video_file_path began")

        # Convert the video to WAV format
        audio_file_path = "videoAudio.wav"
        print("audio_file_path began")
        video = VideoFileClip(video_file_path)
        print("video began")
        video.audio.write_audiofile(audio_file_path, codec="pcm_s16le")
        print("write_audiofile began")
        video.close()
        video.audio.close()
    except Exception as e:
        print("The error: ", e)

    return audio_file_path


# Addressing the async call in the if __name__ == "__main__": block
async def main(episodeTitle):
    # Find the youtube link associated with the episodeTitle
    print("Preparing to search for the episodeTitle on youtube")
    print("Searching for: ", episodeTitle)
    bestYouTubeLink = await find_youtube_link(episodeTitle, getSimilarityScore)
    deviationTime = 0

    if bestYouTubeLink:
        # Download the youtube video
        print("Download youtube video and converting it to audio.")
        try:
            download_and_convert_to_wav(bestYouTubeLink)
        except Exception as e:
            print("Some error occurred: ", e)
            print(
                json.dumps(
                    {
                        "youtubeVideoLink": bestYouTubeLink,
                        "deviationTime": deviationTime,
                    }
                )
            )
            return

        print("Done downloading and converting it to audio.")

        # Then find offset
        results = find_offset_between_files("audio.wav", "videoAudio.wav")
        print("Results from time offset calculation:", results)
        if "time_offset" in results:
            deviationTime = results["time_offset"]

        # Return result as a JSON string
        print(
            json.dumps(
                {
                    "youtubeVideoLink": bestYouTubeLink,
                    "deviationTime": deviationTime,
                }
            )
        )


if __name__ == "__main__":
    episodeTitle = sys.argv[1]
    episodeEnclosure = sys.argv[2]
    episodeGuid = sys.argv[3]
    asyncio.run(main(episodeTitle, episodeEnclosure, episodeGuid))
