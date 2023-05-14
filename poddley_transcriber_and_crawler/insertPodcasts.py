from prisma import Prisma
import asyncio 
import pandas as pd
import re 
import subprocess

async def insertPodcasts(objectsToInsert):
    prisma = Prisma()
    await prisma.connect()
    imagesPath = "https://images.poddley.com/";
    
    # print("Inserting podcasts and stuff, deleting already existent onces")
    # await prisma.podcast.delete_many()
    # await prisma.episode.delete_many()
    # await prisma.transcription.delete_many()
    print("HERE=======================>")
    
    for object in objectsToInsert:
        object["createdOn"] = pd.to_datetime(int(object["createdOn"]), utc=True, unit='s')
        del object["lastUpdate"]
        del object["oldestItemPubdate"]
        del object["newestItemPubdate"]
    
    for object in objectsToInsert:
        try:
            print("Inserting podcast: ", object["title"])
            titleTrimmed = object["title"]
            titleLowerCased = titleTrimmed.lower()
            titleSplitted = titleLowerCased.split(" ")
            titleSplittedReplaced = [re.sub(r'[^a-z]', '', e) for e in titleSplitted]
            titleSplittedJoined = "-".join(titleSplittedReplaced)
            newImageName = titleSplittedJoined + "-podcastImage"
            object["imageUrl"] = imagesPath + newImageName + ".webp"
            await prisma.podcast.create(data=object)
            subprocess.run(["node", "script.js"], check=True)

        except Exception as e:
            print("ERROR: ", e)
    await ()
    print("Done")