import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _, { first, merge } from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchQuery, MultiSearchResponse } from "meilisearch";
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

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    // Update the class seachString attribute
    this.searchQuery = searchQuery;
    if (this.searchQuery.searchString) this.logSearchQuery(this.searchQuery.searchString).catch((e) => console.error("Failed to log search query:", e));
    console.log("Searching: ", this.searchQuery.searchString);

    // Queries
    let mainQuery: any = {
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
    };
    // If searchString, add it:
    if (this.searchQuery.filter) mainQuery.filter = searchQuery.filter;
    if (this.searchQuery.sort) mainQuery.sort = searchQuery.sort;
    mainQuery.limit = searchQuery.limit === undefined ? 10 : searchQuery.limit <= 100 ? searchQuery.limit : 10;
    if (this.searchQuery.hitsPerPage) mainQuery.hitsPerPage = searchQuery.hitsPerPage;
    if (this.searchQuery.page) mainQuery.page = searchQuery.page;
    if (this.searchQuery.searchString) mainQuery.q = this.searchQuery.searchString;

    // Search results => Perform it.
    let initialSearchResponse: any = await this.segmentsIndex.search(undefined, mainQuery);
    console.log(initialSearchResponse);

    const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))] as string[];
    const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))] as string[];
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);
    const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast) => [podcast.podcastGuid, podcast]));
    const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode) => [episode.episodeGuid, episode]));
 
    // Merged results
    let segmentHits: SegmentHit[] = initialSearchResponse.hits;

    // Assign similarity score to all hits. If no searchString, nothing to calculate essentially
    if (this.searchQuery.searchString) {
      this.addSimilarityScoreToHits(segmentHits, this.searchQuery.searchString);

      // Setting new unique hits
      segmentHits = this.removeDuplicateSegmentHits(segmentHits);
      segmentHits = segmentHits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);
    }

    // Assign podcast and episode information to all the segments
    const searchResponseHits: SearchResponseHit[] = [];
    for (let i = 0; i < segmentHits.length; i++) {
      const searchResponseHit: SegmentHit = segmentHits[i];
      try {
        const searchResponseHitPodcastGuid = podcastsMap.get(searchResponseHit.belongsToPodcastGuid);
        const searchResponseEpisodeGuid = episodesMap.get(searchResponseHit.belongsToEpisodeGuid);
        if (searchResponseHitPodcastGuid && searchResponseEpisodeGuid) {
          const searchResponseHitConstructed: SearchResponseHit = {
            ...segmentHits[i],
            podcastTitle: searchResponseHitPodcastGuid.title,
            episodeTitle: searchResponseEpisodeGuid.episodeTitle,
            podcastSummary: searchResponseHitPodcastGuid.description,
            episodeSummary: searchResponseEpisodeGuid.episodeSummary,
            description: searchResponseHitPodcastGuid.description,
            podcastAuthor: searchResponseHitPodcastGuid.itunesAuthor,
            episodeLinkToEpisode: searchResponseEpisodeGuid.episodeLinkToEpisode,
            episodeEnclosure: searchResponseEpisodeGuid.episodeEnclosure,
            podcastLanguage: searchResponseHitPodcastGuid.language,
            podcastGuid: searchResponseHitPodcastGuid.podcastGuid,
            imageUrl: searchResponseHitPodcastGuid.imageUrl,
            podcastImage: searchResponseHitPodcastGuid.imageUrl,
            episodeGuid: searchResponseEpisodeGuid.episodeGuid,
            url: searchResponseHitPodcastGuid.url,
            link: searchResponseHitPodcastGuid.link,
            youtubeVideoLink: searchResponseEpisodeGuid.youtubeVideoLink || "",
            deviationTime: searchResponseEpisodeGuid.deviationTime || 0,
          };
          searchResponseHits.push(searchResponseHitConstructed);
        }
      } catch (e) {}
    }
    // Just setting the segmentHits finally
    const finalSearchResponse: any = {
      ...initialSearchResponse,
      hits: searchResponseHits,
    };
    return finalSearchResponse;
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

  private addSimilarityScoreToHits(hits: SegmentHit[], originalSearchString: string): void {
    hits.forEach((hit: SegmentHit) => {
      hit.similarity = this.calculateSimilarity(hit, originalSearchString);
    });
  }

  private calculateSimilarity(hit: SegmentHit, originalSearchString: string) {
    const n = 3; // Adjust the value of n for the desired n-gram length
    const originalNgrams = this.createNgrams(originalSearchString, n);
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
      limit: 10,
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
      limit: 10,
      attributesToRetrieve: ["episodeGuid", "podcastGuid"],
      sort: ["addedDate:desc"],
    });

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

    // We perform the query and then we get SearchResultHits
    const d = await this.meilisearchConnection.multiSearch({
      queries: queries,
    });
    console.log(`Time elapsed after multiSearch: ${new Date().getTime() - startTime}ms`);

    // Flatten and get all hits
    const allHits: any = d.results.map((e: any) => e.hits).flat();

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
