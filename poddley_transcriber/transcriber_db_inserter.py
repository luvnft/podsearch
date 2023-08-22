from prisma import Prisma
import asyncio
import os
import json

async def insertJsonFilesToDb(episode):
    prisma = Prisma()
    await prisma.connect()
    print("Now processing jsons")
    try:
        # Loop over the files in the directory jsons and insert them into the database
        for filename in os.listdir("jsons"):
            # Check if filename is a json file and that it doesn't start with a dot
            if not filename.endswith(".json") or filename.startswith("."):
                continue
            
            # Open the file json
            data = None
            with open("jsons/" + filename, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Insert the data into the database
            if data == None:
                continue
                
            print("Processing data from filename", filename)

            # Insert the transcription
            transcription = data["text"]
            segments = data["segments"]
            language = data["language"]
            belongsToPodcastGuid = data["belongsToPodcastGuid"]
            belongsToEpisodeGuid = data["belongsToEpisodeGuid"]

            # Insert the transcription to the db
            transcriptionId = None
            transcriptionData = None

            episodeAgain = await prisma.episode.find_unique(
                where = {
                    "episodeGuid": episode["episodeGuid"]
                }
            )
            if episodeAgain.updatedAt != episode["updatedAt"]:
                await prisma.episode.update(
                    where = {
                        "id": episode["id"]
                    },
                    data = {
                        "isTranscribed": True,
                    }
                )

            try:
                transcriptionData = await prisma.transcription.create(
                    data={
                        "language": language,
                        "belongsToPodcastGuid": belongsToPodcastGuid,
                        "belongsToEpisodeGuid": belongsToEpisodeGuid,
                        "transcription": transcription,
                    }
                )
                transcriptionData = dict(transcriptionData)
                transcriptionId = transcriptionData["id"]
            except Exception as e:
                print("Error occureed from transcription creating, but it's fine: ", e)
            
            if transcriptionId == None:
                try:
                    # Check if the transcription already exists
                    transcriptionData = await prisma.transcription.find_first(
                        where={
                            "belongsToEpisodeGuid": belongsToEpisodeGuid
                        }
                    )
                    transcriptionData = dict(transcriptionData)
                    transcriptionId = transcriptionData["id"]
                except Exception as e:
                    raise Exception ("Error STRAAANGE")

            if transcriptionId == None:
                continue
            
            # Insert the segments to the db if the transcription exists
            segmentData = []
            for segment in segments:
                data = {
                    "start": segment["start"],
                    "end": segment["end"],
                    "language": language,
                    "belongsToPodcastGuid": belongsToPodcastGuid,
                    "belongsToEpisodeGuid": belongsToEpisodeGuid,
                    "belongsToTranscriptId": transcriptionId,
                    "text": segment["text"]
                }
                segmentData.append(data)
            
            # Insert the segments
            try:
                await prisma.segment.create_many(
                    data=segmentData,
                    skip_duplicates=True
                )
            except Exception as e:
                print("Segments exists apparently, ", e)
            
            # Set isTranscribed to true on the episode that the transcription belongs to
            try:
                await prisma.episode.update(
                    where={
                        "episodeGuid": belongsToEpisodeGuid
                    },
                    data={
                        "isTranscribed": True,
                    }
                )
            except Exception as e:
                print("Error: " + str(e))
                raise Exception ("Error")
            
            # Delete the file after it has been inserted into the database
            os.remove("jsons/" + filename)
    finally:
        await prisma.disconnect()
        
        
if __name__ == "__main__":
    # Windows
    asyncio.run(insertJsonFilesToDb())