import subprocess as sp
import asyncio
import fixMacroLanguage
import insertPodcasts
import validatePodcastsBeforeInsert
import sqlite3
import json

def gatherPodcastsFromJsonFile(filename):
    # Connect to the sqlite database
    sqlitedb = sqlite3.connect(filename)
    sqlitedb.row_factory = sqlite3.Row
    sqliteCursor = sqlitedb.cursor()

    # Loop through the podcasts.json file and add the podcasts to the database with the correct information, these are the podcasts that we got from podcharts.com
    j = json.load(open("./podcasts/podcasts.json", encoding="utf8"))
    
    # Create an index on the titles to make the query faster
    sqliteCursor.execute("CREATE INDEX IF NOT EXISTS titleIndex ON podcasts (title)")

    # Array to store all objects to insert
    objectsToInsert = []
    
    # Looping over all 
    for title, value in j.items():
        print("====>Title: ", title)
        sqliteCursor.execute("SELECT * FROM podcasts INDEXED BY titleIndex WHERE title = ? LIMIT 1", (title,))
        podcast = sqliteCursor.fetchone()
        if podcast is None: 
            continue
        podcast = dict(podcast)
        print("====> Found podcast: ", podcast)
        objectToInsert = {}
        for key, value in podcast.items():
            objectToInsert[key] = value
        objectsToInsert.append(objectToInsert)
        
    # Returning the array of podcasts that we want information on based on the podcasts.json file
    return objectsToInsert

async def main():
    # Get the top podcasts from the podcasts.db using the podcasts.json
    objectsToInsert = gatherPodcastsFromJsonFile("./podcasts/podcasts.json")
    
    # Fix the macro language, standardizing them and not differentiating between en.ZH etc. 
    objectsToInsert = fixMacroLanguage.fixMacrolanguage(objectsToInsert)
    
    # Validate the objects before inserting them,
    objectsToInsert = validatePodcastsBeforeInsert.validateObjectsBeforeInsert(objectsToInsert)
    
    # Insert the podcasts validated etc to the database
    await insertPodcasts.insertPodcasts(objectsToInsert)
    
    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./getTopPodcastsUsingTheJson.py"])
    sub1.wait()
    
    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./getAndAddEpisodes.py"])
    sub1.wait()
    
    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./transcribeAndDump.py"])
    sub1.wait()

# Run the darn thing
if __name__ == '__main__':
    asyncio.run(main())
