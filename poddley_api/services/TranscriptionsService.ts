import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _, { first, merge } from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchQuery, MultiSearchResponse } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient, Segment } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { SearchQuery } from "../types/SearchQuery";
import { removeDuplicates, mergeHighlightedAndText } from "./helpers/helpers";

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

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    // Update the class seachString attribute
    this.searchQuery = searchQuery;
    console.log("Searching: ", this.searchQuery.searchString);

    // Queries
    let mainQuery: any = {
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      showMatchesPosition: true,
      matchingStrategy: "all",
    };
    // If searchString, add it:
    if (this.searchQuery.filter) mainQuery.filter = searchQuery.filter;
    if (this.searchQuery.sort) mainQuery.sort = searchQuery.sort;
    if (this.searchQuery.hitsPerPage) mainQuery.hitsPerPage = searchQuery.hitsPerPage;
    if (this.searchQuery.page) mainQuery.page = searchQuery.page;
    if (this.searchQuery.searchString) mainQuery.q = this.searchQuery.searchString;
    mainQuery.limit = searchQuery.limit === undefined ? 100 : searchQuery.limit <= 100 ? searchQuery.limit : 10;

    // Initial search, get ids
    let response: SearchResponse = {} as SearchResponse;
    if (this.searchQuery.category === "quote" || !this.searchQuery.category) response = await this.segmentSearch(mainQuery);
    else if (this.searchQuery.category === "episode") response = await this.episodeSearch(mainQuery);
    else if (this.searchQuery.category === "podcast") response = await this.podcastSearch(mainQuery);

    return response;
  }

  private async episodeSearch(mainQuery: SearchQuery): Promise<SearchResponse> {
    // Query episodes based on searchString
    let initialSearchResponse: EpisodeResponse = await this.episodesIndex.search(undefined, mainQuery);

    // Construct filter and use segmentSearch again with that
    const episodeIds: string[] = initialSearchResponse.hits.map((hit: EpisodeHit) => hit.episodeGuid);
    const filter: string = `episodeGuid=${episodeIds.join(" OR episodeGuid=")}`;

    // New query:
    const newQuery: SearchQuery = {
      ...mainQuery,
      filter: filter,
      sort: ["start:asc"],
    };

    // Query using segmentSearch
    const response: SearchResponse = await this.segmentSearch(newQuery);

    // Return the data
    return response;
  }

  private async podcastSearch(mainQuery: SearchQuery): Promise<SearchResponse> {
    // Query episodes based on searchString
    let initialSearchResponse: PodcastResponse = await this.episodesIndex.search(undefined, mainQuery);

    // Construct filter and use segmentSearch again with that
    const episodeIds: string[] = initialSearchResponse.hits.map((hit: PodcastHit) => hit.podcastGuid);
    const filter: string = `podcastGuid=${episodeIds.join(" OR podcastGuid=")}`;

    // New query:
    const newQuery: SearchQuery = {
      ...mainQuery,
      filter: filter,
      sort: ["start:asc"],
    };

    // Query using segmentSearch
    const response: SearchResponse = await this.segmentSearch(newQuery);

    // Return the data
    return response;
  }

  private async segmentSearch(mainQuery: SearchQuery): Promise<SearchResponse> {
    // Search results => Perform it.
    let initialSearchResponse: any = await this.segmentsIndex.search(undefined, mainQuery);

    const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))] as string[];
    const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))] as string[];
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);
    const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast) => [podcast.podcastGuid, podcast]));
    const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode) => [episode.episodeGuid, episode]));

    // Merged results
    let segmentHits: SegmentHit[] = initialSearchResponse.hits;

    // We need to make 1 query for all segments ascendingly 30sec up 30sec down, sliced on the first dot and the last dot if present, where the result needs to be part of the segmentHit.text
    // Assign podcast and episode information to all the segments
    const searchResponseHits: SearchResponseHit[] = [];
    for (let i = 0; i < segmentHits.length; i++) {
      const segmentHit: SegmentHit = segmentHits[i];

      // Setting up a query for 5 segments up and 5 segments down using some reference (I'm using `start` for this example)
      let surroundingQuery: SearchQuery = {
        filter: `start ${segmentHit.start - 60} TO ${segmentHit.start + 60} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}' AND id != '${segmentHit.id}'`,
        limit: 10,
        sort: ["start:asc"],
        searchString: undefined,
      };

      // Hits around the current looped hit
      let surroundingHits: SegmentResponse = await this.searchSegments(surroundingQuery);

      // Insert segmentHit in the correct position
      let segmentHitIndex = surroundingHits.hits.findIndex((hit) => hit.start > segmentHit.start);

      const preHits: SegmentHit[] = surroundingHits.hits.slice(0, segmentHitIndex);
      const postHits: SegmentHit[] = surroundingHits.hits.slice(segmentHitIndex + 1);

      // Removing falsy values from the text
      let preHitsCombinedText: string = preHits
        .map((hit: SegmentHit) => hit.text.trim())
        .filter(Boolean)
        .join(" ");
      let postHitsCombinedText: string = postHits
        .map((hit: SegmentHit) => hit.text.trim())
        .filter(Boolean)
        .join(" ");

      // Only wanting to start with the start of a sentence. Not Just in the middle of whatever.
      const preHitsCombinedIndex: number = preHitsCombinedText.indexOf(".") + 1;
      const postHitsCombinedIndex: number = postHitsCombinedText.lastIndexOf(".");
      preHitsCombinedText = preHitsCombinedText.slice(preHitsCombinedIndex).trim();
      postHitsCombinedText = postHitsCombinedText.slice(postHitsCombinedIndex).trim();

      const combinedText = `${preHitsCombinedText.trim()} ${segmentHit._formatted.text.trim()} ${postHitsCombinedText.trim()}`.trim();
      segmentHit._formatted.text = combinedText;
      try {
        const searchResponseHitPodcastGuid = podcastsMap.get(segmentHit.belongsToPodcastGuid);
        const searchResponseEpisodeGuid = episodesMap.get(segmentHit.belongsToEpisodeGuid);
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
    const finalSearchResponse: SearchResponse = {
      ...initialSearchResponse,
      hits: searchResponseHits,
    };

    // Assign similarity score to all hits. If no searchString, nothing to calculate essentially
    if (this.searchQuery.searchString) {
      this.addSimilarityScoreToHits(finalSearchResponse.hits, this.searchQuery.searchString);

      // Setting new unique hits
      segmentHits = removeDuplicates(segmentHits, "id");
      segmentHits = segmentHits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);
    }
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

  private addSimilarityScoreToHits(hits: SegmentHit[] | SearchResponseHit[], originalSearchString: string): void {
    hits.forEach((hit: SegmentHit | SearchResponseHit) => {
      hit.similarity = this.calculateSimilarity(hit, originalSearchString);
    });
  }

  private calculateSimilarity(hit: SegmentHit | SearchResponseHit, originalSearchString: string) {
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

  private async searchSegments(searchQuery: SearchQuery): Promise<SegmentResponse> {
    // Update the class searchQuery attribute
    this.searchQuery = searchQuery;

    // Create mainQuery using the structure from the main search function
    let mainQuery: any = {
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      matchingStrategy: "all",
    };
    if (this.searchQuery.filter) mainQuery.filter = searchQuery.filter;
    if (this.searchQuery.sort) mainQuery.sort = searchQuery.sort;
    mainQuery.limit = searchQuery.limit === undefined ? 10 : searchQuery.limit <= 100 ? searchQuery.limit : 10;
    if (this.searchQuery.hitsPerPage) mainQuery.hitsPerPage = searchQuery.hitsPerPage;
    if (this.searchQuery.page) mainQuery.page = searchQuery.page;
    if (this.searchQuery.searchString) mainQuery.q = this.searchQuery.searchString;

    // Search the index using the mainQuery and return the result
    const resData: SegmentResponse = await this.segmentsIndex.search(undefined, mainQuery);
    return resData;
  }
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
