import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { SearchResponse, SearchResponseHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _ from "lodash";
import { Index, MeiliSearch } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { Category, SearchQuery } from "../types/SearchQuery";
import { formatSearchResponse, removeDuplicates } from "./helpers/helpers";
import { SearchParams } from "../types/SearchParams";
import { convertSecondsToTime } from "../utils/secondsToTime";

class TranscriptionsService {
  public transcriptionsIndex: Index;
  public prismaConnection: PrismaClient = {} as PrismaClient;
  public meilisearchConnection: MeiliSearch;
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

  // Get full transcript functionality
  public async getFullTranscript(episodeGuid: string): Promise<SearchResponse> {
    // MainQuery
    let mainQuery: SearchParams = {
      q: undefined,
      filter: `episoeGuid=${episodeGuid}`,
      limit: 10000, // Hard limit, no way a podcast has more than 10000 segments...
    };

    // Initial search, get ids
    let response: SearchResponse = {} as SearchResponse;

    // At the moment we are defaulting to QUOTE so no need for category check from searchQuery
    response = await this.segmentSearch(mainQuery);

    // Return response
    return response;
  }

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    // MainQuery
    let mainQuery: SearchParams = {
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      showMatchesPosition: true,
      matchingStrategy: "last",
      q: searchQuery.searchString,
      filter: searchQuery.filter,
      limit: searchQuery.limit === undefined ? 50 : searchQuery.limit <= 50 ? searchQuery.limit : 10,
    };

    // Initial search
    let response: SearchResponse = await this.segmentSearch(mainQuery);

    // Return response
    return response;
  }

  private async segmentSearch(searchParams: SearchParams): Promise<SearchResponse> {
    // Search results => Perform it.
    let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(undefined, searchParams);
    let searchResponse: SearchResponse = {
      query: searchParams.q || "",
      hits: [],
    };

    // Getting the podcast ids and episode ids to fetch them further as they are not part of the segmentObjects on the segmentsIndex
    const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))] as string[];
    const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))] as string[];

    // Making a query for the podcast and episodes based on the ids connected to the segments
    const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds(podcastIds), this.searchEpisodesWithIds(episodeIds)]);
    const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast) => [podcast.podcastGuid, podcast]));
    const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode) => [episode.episodeGuid, episode]));

    // Get surrounding hits or not depending on boolean flag
    if (searchParams.getFullTranscript) {
    } else {
      for (let i = 0; i < initialSearchResponse.hits.length; i++) {
        const segmentHit: SegmentHit = initialSearchResponse.hits[i];

        // Setting up a query for 5 segments up and 5 segments down using some reference (I'm using `start` for this example)
        let postParams: SearchParams = {
          filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}'`,
          limit: 50,
          sort: ["start:asc"],
          attributesToHighlight: ["text"],
          highlightPreTag: '<span class="highlight">',
          highlightPostTag: "</span>",
          showMatchesPosition: true,
          matchingStrategy: "last",
          q: searchParams.q,
        };

        // Hits around the current looped hit
        let postResponse: SegmentResponse = await this.segmentsIndex.search(undefined, postParams);
        let postHits: SegmentHit[] = postResponse.hits;
        let postHitsCombinedText: string = postHits
          .map((hit: SegmentHit) => hit.text.trim())
          .filter(Boolean)
          .join(" ")
          .trim();
        const combinedTextWithFormattedText = `${segmentHit._formatted.text.trim()} ${postHitsCombinedText.trim()}`.trim();
        // segmentHit._formatted.text = combinedTextWithFormattedText;
        const segmentHitPodcast: PodcastHit = podcastsMap.get(segmentHit.belongsToPodcastGuid) as PodcastHit;
        const segmentHitEpisode: EpisodeHit = episodesMap.get(segmentHit.belongsToEpisodeGuid) as EpisodeHit;
        const firstSearchResponseAsSegmentHit: SegmentHit = {
          text: segmentHit.text,
          id: segmentHit.id,
          start: segmentHit.start,
          end: segmentHit.end,
          language: segmentHit.language,
          belongsToPodcastGuid: segmentHit.belongsToPodcastGuid,
          belongsToEpisodeGuid: segmentHit.belongsToEpisodeGuid,
          belongsToTranscriptId: segmentHit.belongsToTranscriptId,
          indexed: segmentHit.indexed,
          segmentWordEntries: segmentHit.segmentWordEntries,
          _formatted: segmentHit._formatted,
          similarity: segmentHit.similarity,
        };
        const searchResponseHitConstructed: SearchResponseHit = {
          ...segmentHit,
          podcastTitle: segmentHitPodcast.title,
          episodeTitle: segmentHitEpisode.episodeTitle,
          podcastSummary: segmentHitPodcast.description,
          episodeSummary: segmentHitEpisode.episodeSummary,
          description: segmentHitPodcast.description,
          podcastAuthor: segmentHitPodcast.itunesAuthor,
          episodeLinkToEpisode: segmentHitEpisode.episodeLinkToEpisode,
          episodeEnclosure: segmentHitEpisode.episodeEnclosure,
          podcastLanguage: segmentHitPodcast.language,
          podcastGuid: segmentHitPodcast.podcastGuid,
          podcastImage: segmentHitPodcast.imageUrl,
          episodeGuid: segmentHitEpisode.episodeGuid,
          url: segmentHitPodcast.url,
          link: segmentHitPodcast.link,
          youtubeVideoLink: segmentHitEpisode.youtubeVideoLink || "",
          deviationTime: segmentHitEpisode.deviationTime || 0,
          subHits: postHits,
        };
        searchResponse.hits.push(searchResponseHitConstructed);
      }

      // Assign similarity score to all hits. If no searchString, nothing to calculate essentially
      if (searchParams.q) {
        this.addSimilarityScoreToHits(searchResponse.hits, searchParams.q);

        // Setting new unique hits
        searchResponse.hits = removeDuplicates(searchResponse.hits, "id");
        searchResponse.hits = searchResponse.hits.sort((a: SearchResponseHit, b: SearchResponseHit) => b.similarity - a.similarity);
      }
    }

    // Change the response to be correctly formatted
    // Change the response to be correctly formatted
    searchResponse.hits.forEach((responseHit: SearchResponseHit) => {
      if (responseHit && responseHit._formatted) {
        let formattedData = responseHit?.subHits?.map((item: SegmentHit) => {
          let startTime = item.start;
          let endTime = item.end;
          let text = item._formatted.text;
          let words = text.split(/ (?![^<]*>)/g);

          // If bigger than 6 words, gotta make em smaller
          if (words.length > 6) {
            let segments = [];

            // Calculate duration per word in the original segment
            let durationPerWord = (endTime - startTime) / words.length;

            let segmentStartTime = startTime; // Initialize segmentStartTime for the first segment

            while (words.length) {
              // Splice is cutting the words from 0 and removes 6 returning them, leaving words 6 words less
              let segmentWords = words.splice(0, 6); // Adjust the '6' to disperse the words accordingly in the segments
              let segmentEndTime = segmentStartTime + segmentWords.length * durationPerWord; // Getting segmentEndTime which will be the new segmentStartTime for the next segment based on the durationperWord

              // Create and add the formatted segment to the segments array
              segments.push(`<span class="text-gray-400">${convertSecondsToTime(segmentStartTime)}: </span><i>${segmentWords.join(" ").trim()}</i>`);

              // Update the segmentStartTime for the next segment
              segmentStartTime = segmentEndTime;
            }

            return segments.join("<br /> ");
          }

          // If not, let'se goooo
          return `<span class="text-gray-400">${convertSecondsToTime(startTime)}: </span><i>${text}</i>`;
        });

        responseHit._formatted.text = formattedData?.join("<br /> ") || "";
      }
    });

    return searchResponse;
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
