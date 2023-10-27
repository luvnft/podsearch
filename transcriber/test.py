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
import asyncio
import spacy
from audioOffsetFinder import find_offset_between_files
from pytube import YouTube
from moviepy.editor import *
from googlesearch import search
import aiohttp
import re
from pytube import YouTube
import requests

YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query="
nlp = spacy.load('en_core_web_sm')

def getSimilarityScore(text1, text2):
    # Process the texts
    doc1 = nlp(text1)
    doc2 = nlp(text2)

    # Get the similarity between the two texts
    similarity = doc1.similarity(doc2)

    return similarity

async def search_youtube(query):
    async with aiohttp.ClientSession() as session:
        response = await session.get(YOUTUBE_SEARCH_URL + query)
        page_content = await response.text()
        video_ids = re.findall(r"watch\?v=(\S{11})", page_content)
        return video_ids

def get_video_title(video_id):
    return YouTube(f"https://www.youtube.com/watch?v={video_id}").title

async def find_youtube_link(episodeTitle):
    print("Preparing to search for the episodeTitle on youtube")
    print("Searching for:", episodeTitle)
    
    video_ids = await search_youtube(episodeTitle)
    video_ids = list(set(video_ids))[0:20]
    print("Length of the videoIds: ", len(video_ids))
    
    maxScore = 0
    bestLinkId = ""
    
    print(video_ids)

    for vid in video_ids:
        print("Checking:", vid)
        title = get_video_title(vid)
        print("Checking:", title)
        score = getSimilarityScore(episodeTitle, title)
        print("Returned value is:", score)

        if score > maxScore and score > 0.8:
            maxScore = score
            print("Setting value:", score)
            print("MaxScore is:", maxScore)
            bestLinkId = vid

    print("BestLinkID:", bestLinkId)

print("OK")
asyncio.run(find_youtube_link("Lex Fridman got offended by Joe using the word Nerd"))