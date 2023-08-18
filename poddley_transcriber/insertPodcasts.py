from prisma import Prisma
from prisma.models import Podcast, Episode
import asyncio 
import pandas as pd
import re 
import subprocess
import json
import time

async def insertPodcasts(objectsToInsert):
    prisma = Prisma()
    await prisma.connect()
    
    print("HERE=======================>")
    
    for object in objectsToInsert:
        object["createdOn"] = pd.to_datetime(int(object["createdOn"]), utc=True, unit='s')
        del object["lastUpdate"]
        del object["oldestItemPubdate"]
        del object["newestItemPubdate"]
    
    for object in objectsToInsert:
        try:
            print("Inserting podcast: ", object["title"])
            await prisma.podcast.create(data=object)

        except Exception as e:
            print("ERROR: ", e)

    print("Done")