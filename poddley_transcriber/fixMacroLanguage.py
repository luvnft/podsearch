import langcodes

def fixMacrolanguage(objectsToInsert):
    if len(objectsToInsert) == 0:
        return objectsToInsert
    
    objectsToInsertCopy = []
    
    for index, obj in enumerate(objectsToInsert):
        try:
            if obj["language"] is not None and obj["language"]  != "":
                macroLanguage = langcodes.standardize_tag(obj["language"].strip(), macro=True)
                macroLanguage = macroLanguage[0:2]
                if macroLanguage in ["en", "no", "es"]:
                    obj["language"] = macroLanguage
                    objectsToInsertCopy.append(obj)
        except Exception as e:
            continue
        
    return objectsToInsertCopy