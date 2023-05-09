import asyncio
import fixMacroLanguage
import removeUndesiredCategories
import insertPodcasts
import prepareObjectsToInsert
import validatePodcastsBeforeInsert

async def main():
    # Get the top podcasts from the podcasts.db
    objectsToInsert = prepareObjectsToInsert.prepareObjectsToInsert()
    
    # Fix the macro language
    objectsToInsert = fixMacroLanguage.fixMacrolanguage(objectsToInsert)
    
    # Remove undesired categories
    # objectsToInsert = removeUndesiredCategories.removeUndesiredCategories(objectsToInsert)
    
    # Validate the objects before inserting them
    objectsToInsert = validatePodcastsBeforeInsert.validateObjectsBeforeInsert(objectsToInsert)
    
    # Insert the podcast
    await insertPodcasts.insertPodcasts(objectsToInsert)
    
if __name__ == "__main__":
    # Run the main function
    asyncio.run(main())
