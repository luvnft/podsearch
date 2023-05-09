import meilisearchConnection from "../other/meilisearchConnection";
import { SearchResponse, Hit } from "../types/SearchResponse";
import { Index } from "meilisearch";
import _, { merge } from "lodash";

class TranscriptionsService {
  public segmentsIndex: Index;
  public transcriptionsIndex: Index;
  public searchString: string = "";

  public constructor() {
    this.segmentsIndex = meilisearchConnection.index("segments");
    this.transcriptionsIndex = meilisearchConnection.index("transcriptions");
  } 

  public removeDuplicateHits(hits: Hit[]) {
    // Remove duplicates
    const uniqueHits = [];
    const seenSet: Set<string> = new Set();
    for (let hit of hits) {
      if (seenSet.has(hit.id)) continue;
      else {
        seenSet.add(hit.id);
        uniqueHits.push(hit);
      }
    }
    return uniqueHits;
  }

  public async search(searchString: string): Promise<SearchResponse> {
    // Calculating time
    const startTime = new Date().getTime();

    // Update the class seachString attribute
    this.searchString = searchString;

    // Search results
    const searchResults: SearchResponse[] = [];

    // Run 1: Just normal search
    const firstResponse: SearchResponse = await this.searchSegments(searchString);
    searchResults.push(firstResponse);

    // Run 2: Remove first word
    const searchStringWithoutFirstWord: string = searchString.replace(/^\S+\s*/g, "");
    const secondResponse: SearchResponse = await this.searchSegments(searchStringWithoutFirstWord);
    searchResults.push(secondResponse);

    // Run 3: Remove last word
    const searchStringWithoutLastWord: string = searchStringWithoutFirstWord.replace(/\s*\S+$/g, "");
    const thirdResponse: SearchResponse = await this.searchSegments(searchStringWithoutLastWord);
    searchResults.push(thirdResponse);

    // Merged results
    let mergedResults: SearchResponse = {} as SearchResponse;

    // Setting query and stuff
    mergedResults.limit = firstResponse.limit;
    mergedResults.query = firstResponse.query;
    mergedResults.offset = firstResponse.offset;
    mergedResults.estimatedTotalHits = firstResponse.estimatedTotalHits;
    mergedResults.processingTimeMs = (firstResponse.processingTimeMs + secondResponse.processingTimeMs + thirdResponse.processingTimeMs) / 3;
    mergedResults.hits = firstResponse.hits.concat(secondResponse.hits, thirdResponse.hits);

    // Assign similarity score to all hits
    this.addSimilarityScoreToHits(mergedResults.hits);

    // Sort the hits before returning
    mergedResults.hits.sort((a: Hit, b: Hit) => b.similarity - a.similarity);

    // Slice the results to top 10
    mergedResults.hits = mergedResults.hits.slice(0, 10);

    // Setting new unique hits
    mergedResults.hits = this.removeDuplicateHits(mergedResults.hits);

    // Ending time calculation
    const elapsedTime = new Date().getTime() - startTime;
    console.log("Elapsed time: ", elapsedTime / 1000);

    // Return the processed results
    return mergedResults;
  }

  private addSimilarityScoreToHits(hits: Hit[]) {
    hits.forEach((hit: Hit) => {
      hit.similarity = this.calculateSimilarity(hit);
    });
  }

  private calculateSimilarity(hit: Hit) {
    const n = 3; // Adjust the value of n for the desired n-gram length
    const originalNgrams = this.createNgrams(this.searchString, n);
    const textNgrams = this.createNgrams(hit.text, n);
    const windowSize = originalNgrams.length;

    if (windowSize === 0) return 0;
    let maxSimilarity = 0;

    for (let i = 0; i <= textNgrams.length - windowSize; i++) {
      const textWindow = textNgrams.slice(i, i + windowSize);
      const similarityScore = this.jaccardSimilarity(originalNgrams, textWindow);
      maxSimilarity = Math.max(maxSimilarity, similarityScore);
    }

    return maxSimilarity;
  }

  private createNgrams(text: string, n: number): string[] {
    const ngrams = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.slice(i, i + n));
    }
    return ngrams;
  }

  private jaccardSimilarity(setA: any, setB: any) {
    const intersection = _.intersection(setA, setB).length;
    const union = _.union(setA, setB).length;
    return intersection / union;
  }

  private async searchSegments(searchString: string): Promise<SearchResponse> {
    // Search the index
    const resData: SearchResponse = await this.segmentsIndex.search(searchString, {
      limit: 100,
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      matchingStrategy: 'last'
    });

    // Return data
    return resData;
  }
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default new TranscriptionsService();
