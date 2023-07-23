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

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    // Calculating time
    const startTime = new Date().getTime();

    // Update the class seachString attribute
    this.searchQuery = searchQuery;
    if (this.searchQuery.searchString) this.logSearchQuery(this.searchQuery.searchString).catch((e) => console.error("Failed to log search query:", e));
    console.log("Searching: ", this.searchQuery.searchString);

    // Queries
    let queries: MultiSearchQuery[] = [
      {
        indexUid: "segments",
        limit: 10,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="highlight">',
        highlightPostTag: "</span>",
      },
    ];

    // If searchString, add it:
    if (this.searchQuery.searchString !== undefined) queries[0].q = searchQuery.searchString;

    // If filter add it
    if (this.searchQuery.filter) queries[0].filter = searchQuery.filter;

    console.log(queries[0]);

    // Search results => Perform it.
    const initialSearchResponse: any = await this.meilisearchConnection.multiSearch({ queries });

    // Flatten and get all hits
    let allHits: SegmentHit[] = initialSearchResponse.results.map((e: any) => e.hits).flat();
    allHits = this.removeDuplicateSegmentHits(allHits);

    const podcastIds = [...new Set(allHits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))];
    const episodeIds = [...new Set(allHits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))];

    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);

    const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast) => [podcast.podcastGuid, podcast]));
    const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode) => [episode.episodeGuid, episode]));

    // Merged results
    let mergedResults: SegmentResponse = {} as SegmentResponse;

    // Merging hits
    mergedResults.hits = allHits;

    // Assign similarity score to all hits. If no searchString, nothing to calculate essentially
    if (this.searchQuery.searchString) {
      this.addSimilarityScoreToHits(mergedResults.hits, this.searchQuery.searchString);

      // Setting new unique hits
      mergedResults.hits = this.removeDuplicateSegmentHits(mergedResults.hits);
      mergedResults.hits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);
    }
    console.log(mergedResults.hits)
    mergedResults.hits = mergedResults.hits.slice(0, 10);
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
        const podcastHit = podcastsMap.get(segment.belongsToPodcastGuid);
        const episodeHit = episodesMap.get(segment.belongsToEpisodeGuid);

        if (podcastHit && episodeHit) {
          searchResponseHit = {
            id: segment.id,
            podcastTitle: podcastHit.title,
            episodeTitle: episodeHit.episodeTitle,
            podcastSummary: podcastHit.description,
            episodeSummary: episodeHit.episodeSummary,
            description: podcastHit.description,
            text: segment.text,
            podcastAuthor: podcastHit.itunesAuthor,
            belongsToTranscriptId: segment.belongsToTranscriptId,
            start: segment.start,
            end: segment.end,
            episodeLinkToEpisode: episodeHit.episodeLinkToEpisode,
            episodeEnclosure: episodeHit.episodeEnclosure,
            podcastLanguage: podcastHit.language,
            podcastGuid: podcastHit.podcastGuid,
            imageUrl: podcastHit.imageUrl,
            podcastImage: podcastHit.imageUrl,
            episodeGuid: episodeHit.episodeGuid,
            url: podcastHit.url,
            link: podcastHit.link,
            youtubeVideoLink: episodeHit.youtubeVideoLink || "",
            deviationTime: episodeHit.deviationTime || 0,
            similarity: segment.similarity,
            _formatted: segment._formatted,
          };
          finalResponse.hits.push(searchResponseHit);
        }
      } catch (e) {
        console.error("Error processing segment hit:", segment, "Error:", e);
      }
    }

    // Ending time calculation
    const elapsedTime = new Date().getTime() - startTime;
    finalResponse.estimatedTotalHits = mergedResults.estimatedTotalHits;
    finalResponse.limit = mergedResults.limit;
    finalResponse.offset = mergedResults.offset;
    finalResponse.processingTimeMs = elapsedTime;
    finalResponse.query = mergedResults.query;
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
