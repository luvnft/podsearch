import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _, { first, merge } from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchQuery } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { SearchQuery } from "../types/SearchQuery";

class TranscriptionsService {
  public transcriptionsIndex: Index;
  public prismaConnection: PrismaClient = {} as PrismaClient;
  public meilisearchConnection: MeiliSearch;
  public searchQuery: SearchQuery = {} as SearchQuery;
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
 
  //Returns unique hits for a SegmentHit array
  public removeDuplicateSegmentHits(hits: SegmentHit[]): SegmentHit[] {
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

  //Log function for searhc queries
  private async logSearchQuery(searchString: string): Promise<void> {
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

  //Gets top 10 segments using a custom SQL query as the query is unecessary complicated with prisma
  public async getTrending(): Promise<SearchResponse> {
    const startTime = new Date().getTime(); 
    console.log("Getting...22") 
    // First we try to get top 10 search queries on the last weeks trending, if length == 0 we take the global trending
    let top10Queries: string[] = [];

    let query: any[] = await this.prismaConnection.$queryRaw`
      SELECT LOWER(searchQuery) AS searchQueryLower, COUNT(*) as count 
      FROM SearchLog 
      WHERE createdAt  >= CURDATE() - INTERVAL DAYOFWEEK(CURDATE())+1 DAY
      GROUP BY searchQueryLower
      ORDER BY count DESC
      LIMIT 10;
    `;
    console.log(`Time elapsed after first query: ${new Date().getTime() - startTime}ms`);
  
    if (!query) {
      query = await this.prismaConnection.$queryRaw`
      SELECT LOWER(searchQuery) AS searchQueryLower, COUNT(*) as count  
      FROM SearchLog
      GROUP BY searchQueryLower
      ORDER BY count DESC  
      LIMIT 10;
    `;
    }
    console.log(`Time elapsed after second query (if executed): ${new Date().getTime() - startTime}ms`);
 
    //Convert top10Queries to pure strings
    if (query.length > 0){
      top10Queries = query.map((e: any) => e.searchQueryLower?.toLowerCase() || '');
      console.log("OKKK")
    }
    else{
      top10Queries = "this is top 10 entries when searchlog is empty .".split(" ");
      console.log("NOOO")
    }
    console.log(query);
    console.log(top10Queries)
    // Then we create a query for each searchString as MultiSearhQuery is faster and also what other way can one do it?
    const queries: MultiSearchQuery[] = [];
    for (let i = 0; i < top10Queries.length; i++) {
      const query: string = top10Queries[i];
      console.log("Query is: ", query); 
      queries.push({
        indexUid: "segments",
        q: query,
        limit: 1,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="highlight">',
        highlightPostTag: "</span>", 
        sort: ["start:asc"]
      });
    }
    console.log(`Time elapsed after creating queries: ${new Date().getTime() - startTime}ms`);

    // We perform the query and then we get SearchResultHits
    const d = await this.meilisearchConnection.multiSearch({
      queries: queries,
    });
    console.log(`Time elapsed after multiSearch: ${new Date().getTime() - startTime}ms`);

    // Flatten and get all hits
    const allHits: any = d.results.map((e: any) => e.hits).flat();

    // Adding podcasts and episodes to the corresponding segments
    const podcastIds: string[] = allHits.map((hit: SegmentHit) => hit.belongsToPodcastGuid);
    const episodeIds: string[] = allHits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid);

    // Get the podcasts and episodes
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(Array.from(podcastIds)), this.searchEpisodesWithIds(Array.from(episodeIds))]);
    console.log(`Time elapsed after fetching podcasts and episodes: ${new Date().getTime() - startTime}ms`);

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

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    // Calculating time
    const startTime = new Date().getTime();

    // Update the class seachString attribute
    this.searchQuery = searchQuery;

    // Search results
    const initialSearchResponse: SegmentResponse[] = [];

    // Run 1: Just normal search
    console.log("Searching this: ", searchQuery.searchString)
    const firstResponse: SegmentResponse = await this.searchSegments(searchQuery.searchString.replace(/^\S+\s*/g, ""));
    initialSearchResponse.push(firstResponse);

    console.log("Funzies: ", firstResponse);

    // Merged results
    let mergedResults: SegmentResponse = {} as SegmentResponse;

    // Merging hits 
    mergedResults.hits = firstResponse.hits;

    // Assign similarity score to all hits
    this.addSimilarityScoreToHits(mergedResults.hits);

    // Sort the hits before returning
    mergedResults.hits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);

    // Slice the results to top 10
    mergedResults.hits = mergedResults.hits.slice(0, 10);

    // Setting new unique hits
    mergedResults.hits = this.removeDuplicateSegmentHits(mergedResults.hits);

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

    // Final touchup
    finalResponse.estimatedTotalHits = mergedResults.estimatedTotalHits;
    finalResponse.limit = mergedResults.limit;
    finalResponse.offset = mergedResults.offset;
    finalResponse.processingTimeMs = elapsedTime;
    finalResponse.query = mergedResults.query;

    //Returning
    await this.logSearchQuery(searchQuery.searchString);
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

  private addSimilarityScoreToHits(hits: SegmentHit[]): void {
    hits.forEach((hit: SegmentHit) => {
      hit.similarity = this.calculateSimilarity(hit);
    });
  }

  private calculateSimilarity(hit: SegmentHit) {
    const n = 3; // Adjust the value of n for the desired n-gram length
    const originalNgrams = this.createNgrams(this.searchQuery.searchString, n);
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

  public async getNew(): Promise<SearchResponse> {
    const startTime = new Date().getTime();
    // Getting
    const tenNewestEpisodes: any = await this.episodesIndex.search("", {
      limit: 50,
      attributesToRetrieve: ["episodeGuid", "podcastGuid"],
      sort: ["addedDate:desc"],
    });
    console.log("Number of episodes: ", tenNewestEpisodes.hits.map((e: any, index: number) => index + " " + e.episodeTitle));
    console.log(`Time elapsed after tenNewestEpisodes: ${new Date().getTime() - startTime}ms`);
  
    const episodeIds: string[] = tenNewestEpisodes.hits.map((episode: any) => episode.episodeGuid);
    const podcastIds: string[] = tenNewestEpisodes.hits.map((episode: any) => episode.podcastGuid);
  
    // Then we create a query for each searchString as MultiSearhQuery is faster and also what other way can one do it?
    const queries: MultiSearchQuery[] = [];
    for (let i = 0; i < episodeIds.length; i++) { 
      const filter = "belongsToEpisodeGuid=" + "'" + episodeIds[i] + "'";
      queries.push({
        indexUid: "segments",
        limit: 1, 
        filter: filter,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="highlight">',
        highlightPostTag: "</span>",
        sort: ["start:asc"],
        q: "",
      });
    }
  
    console.log("Queries: ", queries.length);
    console.log(`Time elapsed after creating queries: ${new Date().getTime() - startTime}ms`);
  
    // We perform the query and then we get SearchResultHits
    const d = await this.meilisearchConnection.multiSearch({
      queries: queries,
    });
    console.log(`Time elapsed after multiSearch: ${new Date().getTime() - startTime}ms`);
  
    // Flatten and get all hits
    const allHits: any = d.results.map((e: any) => e.hits).flat();
    console.log("ALl hits is: ", allHits.length);
  
    // Get the podcasts and episodes
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(Array.from(podcastIds)), this.searchEpisodesWithIds(Array.from(episodeIds))]);
    console.log(`Time elapsed after fetching podcasts and episodes: ${new Date().getTime() - startTime}ms`);
  
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

    // Ending time calculation
    const elapsedTime = new Date().getTime() - startTime;

    // Final touchup
    finalResponse.estimatedTotalHits = allHits.length;
    finalResponse.limit = 10;
    finalResponse.offset = 0;
    finalResponse.processingTimeMs = elapsedTime;
    finalResponse.query = "";

    //Returning
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

  public async getSegment(id: string): Promise<SearchResponse> {
    const startTime = new Date().getTime();
    console.log("Getting segment: ", id);

    const segmentResponse: SegmentResponse = await this.segmentsIndex.search(id, {
      limit: 1,
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      matchingStrategy: "all", 
    });

    const podcastIds: string[] = segmentResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid);
    const episodeIds: string[] = segmentResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid);

    //Get the podcasts and episodes
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);
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

    const segment = segmentResponse.hits[0];
    const searchResponseHit: SearchResponseHit = {
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

    // Ending time calculation
    const elapsedTime = new Date().getTime() - startTime;

    // Final touchup
    finalResponse.estimatedTotalHits = segmentResponse.estimatedTotalHits;
    finalResponse.limit = segmentResponse.limit;
    finalResponse.offset = segmentResponse.offset;
    finalResponse.processingTimeMs = elapsedTime;
    finalResponse.query = segmentResponse.query;

    //Returning
    return finalResponse;
  }
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
