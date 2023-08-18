from prisma import Prisma
import whisperx
import asyncio
import transcribeAndDumpIt

model_size = "tiny.en"
device = "cuda"
compute_type = "float16"  # change to "int8" if low on GPU mem (may reduce accuracy)

async def findOneEpisode(prismaInstance):
    episode = await prismaInstance.episode.find_first(
        where={"isTranscribed": False, "beingTranscribed": False, "causedError": False}
    )
    return episode


async def main():
    prisma = Prisma()
    await prisma.connect()

    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model(model_size, device, compute_type=compute_type)
    print("Using the model:", model_size)

    # Looping over all the episodes in the database
    while True:
        try:
            # Get the rows of episodes for that iteration skip value and take value
            episode = await findOneEpisode(prisma)
            episode = dict(episode)
            
            if episode == None:
                # No more episodes to transcribe, so finishing.
                break
            else:
                # Updating the episode to beingTranscribed to avoid collisions.
                print("Found this one: ", episode.id)
                await prisma.episode.update(
                    where={"id": episode.id}, data={"beingTranscribed": True}
                )

                # Transcribe and Insert
                print("Transcribing:", episode.episodeTitle)
                await transcribeAndDumpIt.transcribeAndDumpIt(episode, model)
                print("Done with episode: ", episode.id, "=> Next!")
        except Exception as e:
            print("SHIT SHIT SHIT, error occurred", str(e))
            # If the transcribing fails, then set the beingTranscribed column to false
            await prisma.episode.update(
                where={"id": episode.id},
                data={
                    "beingTranscribed": False,
                    "isTranscribed": False,
                    "causedError": True,
                },
            )
            # Then delete any segments which might have been added that belong to that given episodeGuid
            await prisma.segment.delete_many(
                where={"belongsToEpisodeGuid": episode.episodeGuid},
            )
            # As well with the transcriptions
            await prisma.transcription.delete(
                where={"belongsToEpisodeGuid": episode.episodeGuid}
            )


if __name__ == "__main__":
    # Run the main function
    asyncio.run(main())
