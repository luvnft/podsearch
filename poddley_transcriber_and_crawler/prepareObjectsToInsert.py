import sqlite3
import json

def prepareObjectsToInsert():
    # Connect to the sqlite database
    sqlitedb = sqlite3.connect("./podcasts.db")
    sqlitedb.row_factory = sqlite3.Row
    sqliteCursor = sqlitedb.cursor()

    # Loop through the podcasts.json file and add the podcasts to the database with the correct information, these are the podcasts that we got from podcharts.com
    j = json.load(open("./podcasts.json", encoding="utf8"))
    
    # Delete index if it exists so we can create a new one
    sqliteCursor.execute("DROP INDEX IF EXISTS titleIndex")
    
    # Create index to make LIKE searching on title faster
    sqliteCursor.execute("CREATE INDEX titleIndex ON podcasts (title COLLATE NOCASE)")

    # Array to store all objects to insert
    objectsToInsert = []
    for title, value in j.items():
        print("====>Title: ", title)
        sqliteCursor.execute("SELECT * FROM podcasts WHERE title LIKE ? LIMIT 1", (title,))
        podcast = sqliteCursor.fetchone()
        if podcast is None: 
            continue
        podcast = dict(podcast)
        print("====>Podcast: ", podcast)
        objectToInsert = {}
        for key, value in podcast.items():
            objectToInsert[key] = value
        objectsToInsert.append(objectToInsert)
        
    return objectsToInsert
