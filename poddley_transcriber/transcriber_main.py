from prisma import Prisma
import whisperx
import asyncio
import transcriber_transcribe

# Vars
batch_size = 16 # reduce if low on GPU mem
model_size = "large-v2"
device = "cuda"
compute_type = "float16"  # change to "int8" if low on GPU mem (may reduce accuracy)

# Main transcriber function
async def main():
    # Initializing prisma client
    prisma = Prisma()
    await prisma.connect()

    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model(model_size, device, compute_type=compute_type)

    # Looping over all the episodes in the database
    while True:
        try:
            # Start a transaction
            await prisma.execute_raw("START TRANSACTION;")

            # Lock and fetch an episode
            episodes = await prisma.execute_raw(
                "SELECT * FROM episode WHERE isTranscribed = False LIMIT 1 FOR UPDATE;"
            )
            episode = dict(episodes[0]) if episodes else None

            # If no episode, then no more episodes to transcribe, so finishing.
            if episode == None:
                break
            else:
                # Transcribe
                print("Transcribing:", episode.episodeTitle)
                await transcriber_transcribe.transcribeAndDumpIt(episode, model, batch_size, device)
                print("Done with episode: ", episode.title, "=> Next!")
        except Exception as e:
            print("Error occurred, rolling back... ", e)
            await prisma.execute_raw('ROLLBACK;')
            raise 

# Run the main function
if __name__ == "__main__":
    asyncio.run(main())