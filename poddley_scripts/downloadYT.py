import os
from pytube import YouTube
from moviepy.editor import AudioFileClip

# Youtube channel link
channel_link = 'https://www.youtube.com/@LiberalHivemind/videos'

# Get the links of all videos
os.system(f'youtube-dl -j --flat-playlist {channel_link} | jq -r .url > urls.txt')

# Read the urls file
with open('urls.txt', 'r') as f:
    urls = f.read().splitlines()

# For each url
for url in urls:
    try:
        # Get video
        video = YouTube(f'https://www.youtube.com/watch?v={url}')

        # Download video
        video.streams.first().download(filename='temp_video')

        # Convert video to audio
        clip = AudioFileClip('temp_video.mp4')
        clip.audio.write_audiofile(f'{video.title}.mp3')

        # Remove temporary video file
        os.remove('temp_video.mp4')
    except Exception as e:
        print(f'Failed to download and convert video: {url}. Reason: {str(e)}')
