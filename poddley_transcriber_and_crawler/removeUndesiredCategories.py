def removeUndesiredCategories(objectsToInsert):
    if len(objectsToInsert) == 0:
        return objectsToInsert
    
    objectsToInsertCopy  = []
    
    for index, obj in enumerate(objectsToInsert):
        hasFaultyCategory = False
        
        for i in range (1, 11):
            cat = "category" + str(i)
            if obj[cat] in ['Arts' 'Business', 'Comedy', 'Education', 'Games & Hobbies', 'Government & Organizations', 'Health', 'Kids & Family', 'Music', 'News & Politics', 'True Crime', 'Christianity', 'Sports', 'Crime', 'Manga', "Art", "Design", "Sports", "christianity", "sports", "fiction", "arts", "true crime", "sports", "improv", "kids", "animation", "manga", "learning", "animation", "design", "music", "commentary", "tv", "film", "music"]:
                hasFaultyCategory = True
                break
            
        if not hasFaultyCategory:
            objectsToInsertCopy.append(obj)
            
    return objectsToInsertCopy