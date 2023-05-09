from prisma import Prisma
import whisper
import asyncio
import transcribeAndDumpIt
from faster_whisper import WhisperModel

model_size = "tiny.en"
async def main():
    prisma = Prisma()
    await prisma.connect()
    
    # model = whisper.load_model("tiny.en")
    model = WhisperModel(model_size, device="cuda", compute_type="float16")
    print("Using the model:", model_size)

    # Looping over all the episodes in the database
    while True:
        # Get the rows of episodes for that iteration skip value and take value
        episode = None
        try:
            episode = await prisma.episode.find_first(
                where = {
                    "isTranscribed": False,
                    "beingTranscribed": False,
                    "causedError": False
                }
            )
            
            print("Found this one: ", episode.id)
            
            if episode == None:
                # No more episodes to transcribe, so finishing.
                break
            
            # Updating the episode to beingTranscribed to avoid collisions.
            await prisma.episode.update(
                where = {
                    "id": episode.id
                },
                data = {
                    "beingTranscribed": True
                }
            )

            # Transcribe and Insert
            print("Transcribing it from dumpIT", episode.episodeTitle)
            await transcribeAndDumpIt.transcribeAndDumpIt([episode], model)
            print("Done with episode and updating", episode.id)
            
            # Set the beingTranscribed back to false
            await prisma.episode.update(
                where = {
                    "id": episode.id
                },
                data = {
                    "beingTranscribed": False,
                    "isTranscribed": True
                }
            )
            print("Done with one, next!")
            
        except Exception as e:
            print("SHIT SHIT SHIT, error occurred", str(e))
            # If the transcribing fails, then set the beingTranscribed column to false
            await prisma.episode.update(
                where = {
                    "id": episode.id
                },
                data = {
                    "beingTranscribed": False,
                    "isTranscribed": False,
                    "causedError": True
                }
            )
            await prisma.segment.delete_many(
                where = {
                    "belongsToEpisodeGuid": episode.episodeGuid
                },
            )
            await prisma.transcription.delete(
                where = {
                    "belongsToEpisodeGuid": episode.episodeGuid
                }
            )

if __name__ == "__main__":
    # Run the main function
    # For windows
    asyncio.run(main())
