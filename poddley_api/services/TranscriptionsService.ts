import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _, { merge } from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchQuery } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

class TranscriptionsService {
  public transcriptionsIndex: Index;
  public prismaConnection: PrismaClient = {} as PrismaClient;
  public meilisearchConnection: MeiliSearch;
  public searchString: string = "";
  public segmentsIndex: Index;
  public podcastsIndex: Index;
  public episodesIndex: Index;

  public constructor() {
    this.transcriptionsIndex = meilisearchConnection.index("transcriptions");
    this.segmentsIndex = meilisearchConnection.index("segments");
    this.podcastsIndex = meilisearchConnection.index("podcasts");
    this.episodesIndex = meilisearchConnection.index("episodes");
    this.prismaConnection = prismaConnection;
    this.meilisearchConnection = meilisearchConnection;
  }

  public removeDuplicateHits(hits: SegmentHit[]) {
    // Remove duplicates
    const uniqueHits: SegmentHit[] = [];
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

  private async logSearchQuery(searchString: string) {
    if (!searchString.trim()) return;
    try {
      //Add searchquery to db
      await this.prismaConnection.searchLog.create({
        data: {
          id: uuidv4(),
          searchQuery: searchString,
        },
      });
    } catch (e) {
      console.log("Error in logger: ", e);
    }
  }

  public async getTop10Segments() {
    const top10Queries: any[] = await this.prismaConnection.$queryRaw`
      SELECT LOWER(searchQuery) AS searchQueryLower, COUNT(*) as count 
      FROM SearchLog
      WHERE timestamp >= CURDATE() - INTERVAL DAYOFWEEK(CURDATE())+1 DAY
      GROUP BY searchQueryLower
      ORDER BY count DESC
      LIMIT 10;
    `;
    const queries: MultiSearchQuery[] = [];
    for (let i = 0; i < top10Queries.length; i++) {
      const query: any = top10Queries[i];
      queries.push({
        indexUid: "segments",
        q: query.searchQueryLower,
        limit: 1,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="highlight">',
        highlightPostTag: "</span>",
        matchingStrategy: "last",
      });
    }

    const d = await this.meilisearchConnection.multiSearch({
      queries: queries,
    });

    //Yes..
    const allHits: any = d.results.map((e: any) => e.hits).flat();

    // Adding podcasts and episodes to the corresponding segments
    const podcastIds: string[] = allHits.map((hit: SegmentHit) => hit.belongsToPodcastGuid);
    const episodeIds: string[] = allHits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid);

    //Get the podcasts and episodes
    const podcasts: PodcastResponse = await this.searchPodcastsWithIds(podcastIds);
    const episodes: EpisodeResponse = await this.searchEpisodesWithIds(episodeIds);
    const podcastsObject: { [key: string]: PodcastHit } = {};
    const episodesObject: { [key: string]: EpisodeHit } = {};
    podcasts.hits.forEach((podcastHit: PodcastHit) => (podcastsObject[podcastHit.podcastGuid] = podcastHit));
    episodes.hits.forEach((episodeHit: EpisodeHit) => (episodesObject[episodeHit.episodeGuid] = episodeHit));
    
    const finalResponse: SearchResponse = {
      hits: [],
      query: "",
      processingTimeMs: 0,
      limit: undefined,
      offset: undefined,
      estimatedTotalHits: undefined,
    };

    for (let i = 0; i < allHits.length; i++) {
      const segment = allHits[i];
      let searchResponseHit: SearchResponseHit;
      try {
        searchResponseHit = {
          id: segment.id,
          podcastTitle: podcastsObject[segment.belongsToPodcastGuid].title,
          episodeTitle: episodesObject[segment.belongsToEpisodeGuid].episodeTitle,
          podcastSummary: podcastsObject[segment.belongsToPodcastGuid].description,
          episodeSummary: episodesObject[segment.belongsToEpisodeGuid].episodeSummary,
          description: podcastsObject[segment.belongsToPodcastGuid].description,
          text: segment.text,
          podcastAuthor: podcastsObject[segment.belongsToPodcastGuid].itunesAuthor,
          belongsToTranscriptId: segment.belongsToTranscriptId,
          start: segment.start,
          end: segment.end,
          episodeLinkToEpisode: episodesObject[segment.belongsToEpisodeGuid].episodeLinkToEpisode,
          episodeEnclosure: episodesObject[segment.belongsToEpisodeGuid].episodeEnclosure,
          podcastLanguage: podcastsObject[segment.belongsToPodcastGuid].language,
          podcastGuid: podcastsObject[segment.belongsToPodcastGuid].podcastGuid,
          imageUrl: podcastsObject[segment.belongsToPodcastGuid].imageUrl,
          podcastImage: podcastsObject[segment.belongsToPodcastGuid].imageUrl,
          episodeGuid: episodesObject[segment.belongsToEpisodeGuid].episodeGuid,
          url: podcastsObject[segment.belongsToPodcastGuid].url,
          link: podcastsObject[segment.belongsToPodcastGuid].link,
          youtubeVideoLink: episodesObject[segment.belongsToEpisodeGuid].youtubeVideoLink || "",
          deviationTime: episodesObject[segment.belongsToEpisodeGuid].deviationTime || 0,
          similarity: segment.similarity,
          _formatted: segment._formatted,
        };
        finalResponse.hits.push(searchResponseHit);
      } catch (e) {
        console.log(e);
      }
    }

    return finalResponse;
  }

  public async search(searchString: string): Promise<SearchResponse> {
    // Calculating time
    const startTime = new Date().getTime();

    // Update the class seachString attribute
    this.searchString = searchString;

    // Search results
    const initialSearchResponse: SegmentResponse[] = [];

    // Run 1: Just normal search
    const firstResponse: SegmentResponse = await this.searchSegments(searchString);
    initialSearchResponse.push(firstResponse);

    // Run 2: Remove first word
    const searchStringWithoutFirstWord: string = searchString.replace(/^\S+\s*/g, "");
    const secondResponse: SegmentResponse = await this.searchSegments(searchStringWithoutFirstWord);
    initialSearchResponse.push(secondResponse);

    // // Run 3: Remove last word
    // const searchStringWithoutLastWord: string = searchStringWithoutFirstWord.replace(/\s*\S+$/g, "");
    // const thirdResponse: SearchResponse = await this.searchSegments(searchStringWithoutLastWord);
    // searchResults.push(thirdResponse);

    // Merged results
    let mergedResults: SegmentResponse = {} as SegmentResponse;

    // Merging hits
    mergedResults.hits = firstResponse.hits.concat(secondResponse.hits);

    // Assign similarity score to all hits
    this.addSimilarityScoreToHits(mergedResults.hits);

    // Sort the hits before returning
    mergedResults.hits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);

    // Slice the results to top 10
    mergedResults.hits = mergedResults.hits.slice(0, 5);

    // Setting new unique hits
    mergedResults.hits = this.removeDuplicateHits(mergedResults.hits);

    // Adding podcasts and episodes to the corresponding segments
    const podcastIds: string[] = mergedResults.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid);
    const episodeIds: string[] = mergedResults.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid);

    //Get the podcasts and episodes
    const podcasts: PodcastResponse = await this.searchPodcastsWithIds(podcastIds);
    const episodes: EpisodeResponse = await this.searchEpisodesWithIds(episodeIds);
    const podcastsObject: { [key: string]: PodcastHit } = {};
    const episodesObject: { [key: string]: EpisodeHit } = {};
    podcasts.hits.forEach((podcastHit: PodcastHit) => (podcastsObject[podcastHit.podcastGuid] = podcastHit));
    episodes.hits.forEach((episodeHit: EpisodeHit) => (episodesObject[episodeHit.episodeGuid] = episodeHit));

    //Modify segments with more properties
    const finalResponse: SearchResponse = {
      hits: [],
      query: "",
      processingTimeMs: 0,
      limit: undefined,
      offset: undefined,
      estimatedTotalHits: undefined,
    };

    for (let i = 0; i < mergedResults.hits.length; i++) {
      const segment = mergedResults.hits[i];
      let searchResponseHit: SearchResponseHit;
      try {
        searchResponseHit = {
          id: segment.id,
          podcastTitle: podcastsObject[segment.belongsToPodcastGuid].title,
          episodeTitle: episodesObject[segment.belongsToEpisodeGuid].episodeTitle,
          podcastSummary: podcastsObject[segment.belongsToPodcastGuid].description,
          episodeSummary: episodesObject[segment.belongsToEpisodeGuid].episodeSummary,
          description: podcastsObject[segment.belongsToPodcastGuid].description,
          text: segment.text,
          podcastAuthor: podcastsObject[segment.belongsToPodcastGuid].itunesAuthor,
          belongsToTranscriptId: segment.belongsToTranscriptId,
          start: segment.start,
          end: segment.end,
          episodeLinkToEpisode: episodesObject[segment.belongsToEpisodeGuid].episodeLinkToEpisode,
          episodeEnclosure: episodesObject[segment.belongsToEpisodeGuid].episodeEnclosure,
          podcastLanguage: podcastsObject[segment.belongsToPodcastGuid].language,
          podcastGuid: podcastsObject[segment.belongsToPodcastGuid].podcastGuid,
          imageUrl: podcastsObject[segment.belongsToPodcastGuid].imageUrl,
          podcastImage: podcastsObject[segment.belongsToPodcastGuid].imageUrl,
          episodeGuid: episodesObject[segment.belongsToEpisodeGuid].episodeGuid,
          url: podcastsObject[segment.belongsToPodcastGuid].url,
          link: podcastsObject[segment.belongsToPodcastGuid].link,
          youtubeVideoLink: episodesObject[segment.belongsToEpisodeGuid].youtubeVideoLink || "",
          deviationTime: episodesObject[segment.belongsToEpisodeGuid].deviationTime || 0,
          similarity: segment.similarity,
          _formatted: segment._formatted,
        };
        finalResponse.hits.push(searchResponseHit);
      } catch (e) {
        console.log(e);
      }
    }

    // Ending time calculation
    const elapsedTime = new Date().getTime() - startTime;
    console.log("Elapsed time: ", elapsedTime / 1000);

    // Final touchup
    finalResponse.estimatedTotalHits = mergedResults.estimatedTotalHits;
    finalResponse.limit = mergedResults.limit;
    finalResponse.offset = mergedResults.offset;
    finalResponse.processingTimeMs = elapsedTime;
    finalResponse.query = mergedResults.query;

    //Returning
    await this.logSearchQuery(searchString);
    return finalResponse;
  }

  private async searchPodcastsWithIds(podcastIds: string[]): Promise<PodcastResponse> {
    // Search the index
    podcastIds = podcastIds.map((e) => `'${e}'`);
    const filter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
    const resData: PodcastResponse = await this.podcastsIndex.search(null, {
      limit: podcastIds.length || 5,
      filter: filter,
    });
    // Return data
    return resData;
  }

  private async searchEpisodesWithIds(episodesIds: string[]): Promise<EpisodeResponse> {
    // Search the index
    episodesIds = episodesIds.map((e) => `'${e}'`);
    const filter: string = `episodeGuid=${episodesIds.join(" OR episodeGuid=")}`;
    const resData: EpisodeResponse = await this.episodesIndex.search(null, {
      limit: episodesIds.length || 5,
      filter: filter,
    });
    // Return data
    return resData;
  }

  private addSimilarityScoreToHits(hits: SegmentHit[]) {
    hits.forEach((hit: SegmentHit) => {
      hit.similarity = this.calculateSimilarity(hit);
    });
  }

  private calculateSimilarity(hit: SegmentHit) {
    const n = 3; // Adjust the value of n for the desired n-gram length
    const originalNgrams = this.createNgrams(this.searchString, n);
    const textNgrams = this.createNgrams(hit.text, n);
    const windowSize = originalNgrams.length;

    if (windowSize === 0) return 0;

    let maxSimilarity = 0;
    let bestMatchStartIndex = 0;
    let bestMatchEndIndex = 0;

    for (let i = 0; i <= textNgrams.length - windowSize; i++) {
      const textWindow = textNgrams.slice(i, i + windowSize);
      const similarityScore = this.jaccardSimilarity(originalNgrams, textWindow);
      if (similarityScore > maxSimilarity) {
        maxSimilarity = similarityScore;
        bestMatchStartIndex = i;
        bestMatchEndIndex = i + windowSize;
      }
    }

    // For the future if I want jaccard highlighting too
    // if (maxSimilarity > 0) {
    // hit._formatted.text = hit._formatted.text.slice(0, bestMatchStartIndex) + "<code>" + hit._formatted.text.slice(bestMatchStartIndex, bestMatchEndIndex) + "</code>" + hit._formatted.text.slice(bestMatchEndIndex);
    // }

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

  private async searchSegments(searchString: string): Promise<SegmentResponse> {
    // Search the index
    const resData: SegmentResponse = await this.segmentsIndex.search(searchString, {
      limit: 50,
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      matchingStrategy: "last",
    });

    // Return data
    return resData;
  }
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
