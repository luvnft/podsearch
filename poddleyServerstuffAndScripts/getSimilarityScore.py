import sys
import spacy

# Load the large English NLP model
nlp = spacy.load('spacy/en_core_web_sm')

# The texts to compare
text1 = sys.argv[1]
text2 = sys.argv[2]

# Process the texts
doc1 = nlp(text1)
doc2 = nlp(text2)

# Get the similarity between the two texts
similarity = doc1.similarity(doc2)

print(similarity)