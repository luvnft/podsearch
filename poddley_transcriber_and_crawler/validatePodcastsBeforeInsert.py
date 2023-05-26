def validateObjectsBeforeInsert(objectsToInsert):
    print("Length is: ", len(objectsToInsert))
    if len(objectsToInsert) == 0:
        return objectsToInsert
    
    objectsToInsertCopy = []
    
    for object in objectsToInsert:
        objectCopy = object.copy()
        del objectCopy["id"]
        del object["lastUpdate"]
        del object["oldestItemPubdate"]
        del object["newestItemPubdate"]
        print(object)
                
        for key in objectCopy.keys():
            if key in ["oldestItemPubdate", "explicit", "dead", "itunesId", "episodeCount", "lastHttpStatus", "lastUpdate", "popularityScore", "newestEnclosureDuration", "priority", "createdOn", "updateFrequency"]:
                if objectCopy[key] == None: objectCopy[key] = 0
                if objectCopy[key] == "": objectCopy[key] = 0
            else:
                if objectCopy[key] == None: objectCopy[key] = ""
                if objectCopy[key] == "": objectCopy[key] = ""
        
        objectsToInsertCopy.append(objectCopy)
                
    return objectsToInsertCopy
            
