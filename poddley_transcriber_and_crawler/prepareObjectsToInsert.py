import sqlite3
import json

def prepareObjectsToInsert():
    # Connect to the sqlite database
    sqlitedb = sqlite3.connect("./podcasts.db")
    sqlitedb.row_factory = sqlite3.Row
    sqliteCursor = sqlitedb.cursor()

    # Loop through the podcasts.json file and add the podcasts to the database with the correct information, these are the podcasts that we got from podcharts.com
    j = json.load(open("./podcasts.json", encoding="utf8"))
    sqliteCursor.execute("CREATE INDEX IF NOT EXISTS titleIndex ON podcasts (title)")

    # Array to store all objects to insert
    objectsToInsert = []
    for title, value in j.items():
        print("====>Title: ", title)
        sqliteCursor.execute("SELECT * FROM podcasts INDEXED BY titleIndex WHERE title = ? LIMIT 1", (title,))
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
