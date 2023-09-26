import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _ from "lodash";
import { Index, MeiliSearch, SearchParams } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { Category, SearchQuery } from "../types/SearchQuery";
import { removeDuplicates } from "./helpers/helpers";

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

    // MainQuery
    let mainQuery: SearchParams = {
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      showMatchesPosition: true,
      matchingStrategy: "last",
      q: searchQuery.searchString,
      filter: searchQuery.filter,
      limit: this.searchQuery.limit === undefined ? 50 : this.searchQuery.limit <= 50 ? this.searchQuery.limit : 10,

    };

    // Initial search, get ids
    let response: SearchResponse = {} as SearchResponse;

    // At the moment we are defaulting to QUOTE so no need for category check from searchQuery
    response = await this.segmentSearch(mainQuery);

    // Return response
    return response;
  }

  private async segmentSearch(searchParams: SearchParams): Promise<SearchResponse> {
    // Search results => Perform it.
    let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(undefined, searchParams);

    // Getting the podcast ids and episode ids to fetch them further
    const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))] as string[];
    const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))] as string[];

    // Making a query for the podcast and episodes based on the ids connected to the segments
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);
    const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast) => [podcast.podcastGuid, podcast]));
    const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode) => [episode.episodeGuid, episode]));

    // We need to make 1 query for all segments ascendingly 60sec only up, sliced on the first dot and the last dot if present, where the result needs to be part of the segmentHit.text
    // Assign podcast and episode information to all the segments
    const searchResponseHits: SearchResponseHit[] = [];
    let segmentHits: SegmentHit[] = initialSearchResponse.hits;
    for (let i = 0; i < segmentHits.length; i++) {
      const segmentHit: SegmentHit = segmentHits[i];

      // Setting up a query for 5 segments up and 5 segments down using some reference (I'm using `start` for this example)
      let surroundingQuery: SearchParams = {
        filter: `start ${segmentHit.start} TO ${segmentHit.start + 60} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}' AND id != '${segmentHit.id}'`,
        limit: 10,
        sort: ["start:asc"],
        q: searchParams.q,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="highlight">',
        highlightPostTag: "</span>",
        showMatchesPosition: true,
        matchingStrategy: "last",
      };

      // Hits 60 seconds in front the current looped hit
      let segmentResponse60secInfrontOfSegmentHit: SegmentResponse = await this.segmentsIndex.search(undefined, surroundingQuery);
      const hits60secInFrontOfSegmentHit: SegmentHit[] = [segmentHit, ...segmentResponse60secInfrontOfSegmentHit.hits];

      // Removing falsy values from the text
      let postHitsCombinedText: string = hits60secInFrontOfSegmentHit
        .map((hit: SegmentHit) => hit.text.trim())
        .filter(Boolean)
        .join(" ");

      // Only wanting to start with the start of a sentence. Not Just in the middle of whatever.
      const postHitsCombinedIndex: number = postHitsCombinedText.lastIndexOf(".");
      postHitsCombinedText = postHitsCombinedText.slice(postHitsCombinedIndex).trim();

      const combinedText = `${segmentHit._formatted.text.trim()} ${postHitsCombinedText.trim()}`.trim();
      segmentHit._formatted.text = combinedText;
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
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
