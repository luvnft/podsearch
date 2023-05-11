from prisma import Prisma
import asyncio 
import pandas as pd

async def insertPodcasts(objectsToInsert):
    prisma = Prisma()
    await prisma.connect()
    
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
            await prisma.podcast.create(data=object)
        except Exception as e:
            print("ERROR: ", e)
    await ()
    print("Done")