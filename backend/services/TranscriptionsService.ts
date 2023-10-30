import { meilisearchConnection } from "../connections/meilisearchConnection";
import { prismaConnection } from "../connections/prismaConnection";
import { ClientSearchResponse, ClientSearchResponseHit, ClientSegmentHit } from "../types/ClientSearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _ from "lodash";
import { Index, MeiliSearch } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { SearchQuery } from "../types/SearchQuery";
import { SearchParams } from "../types/SearchParams";
import { convertSegmentHitToClientSegmentHit } from "../utils/helpers";

const SEGMENTS_TO_SEARCH: number = 25;

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

  //The search function (main one main use)
  public async search(searchQuery: SearchQuery): Promise<ClientSearchResponse> {
    // MainQuery
    let mainQuery: SearchParams = {
      matchingStrategy: "all",
      q: searchQuery.searchString,
      filter: searchQuery.filter,
      limit: SEGMENTS_TO_SEARCH,
      offset: searchQuery.offset || 0,
    };

    // Modify mainQuery if we want a fullTranscript
    if (searchQuery.getFullTranscript) {
      mainQuery = {
        filter: searchQuery.filter,
        limit: 10000,
        q: "",
        matchingStrategy: "all",
        sort: ["start:asc"],
      };
    }

    // Initial search
    let response: ClientSearchResponse = await this.segmentSearch(mainQuery, searchQuery?.getFullTranscript || false);

    // Return response
    return response;
  }

  private async segmentSearch(searchParams: SearchParams, getFullTranscript: boolean): Promise<ClientSearchResponse> {
    if (getFullTranscript) {
      // Perform initial search on the segmentsIndex to get the segments
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search("", searchParams);

      // Final ClientSearchResponse object
      let searchResponse: ClientSearchResponse = {
        query: searchParams.q || "",
        hits: [],
      };

      // Getting the podcast ids and episode ids to fetch them further as they are not part of the segmentObjects on the segmentsIndex
      const podcastIdsSet: Set<string> = new Set<string>();
      const episodeIdsSet: Set<string> = new Set<string>();
      const initialSearchResponseLength: number = initialSearchResponse.hits.length;

      // Getting last ids for podcasts and episodes
      for (let i = 0; i < initialSearchResponseLength; i++) {
        podcastIdsSet.add(initialSearchResponse.hits[i].belongsToPodcastGuid);
        episodeIdsSet.add(initialSearchResponse.hits[i].belongsToEpisodeGuid);
      }

      // Get last podcasts and episodes based on initial request as the segmentIndex doesn't store them
      const [podcasts, episodes] = await Promise.all([this.searchPodcastsWithIds([...podcastIdsSet]), this.searchEpisodesWithIds([...episodeIdsSet])]);

      // Making a map between the podcast and episodes based on the ids connected to the segments
      const podcastsMap: Map<string, PodcastHit> = new Map(podcasts.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
      const episodesMap: Map<string, EpisodeHit> = new Map(episodes.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));

      // Construct the searchResponseHit in accorance to the podcastMap, episodeMap and the segmentHits
      const segmentHit: SegmentHit = initialSearchResponse.hits[0];
      const segmentHitPodcast: PodcastHit | undefined = podcastsMap.get(segmentHit.belongsToPodcastGuid);
      const segmentHitEpisode: EpisodeHit | undefined = episodesMap.get(segmentHit.belongsToEpisodeGuid);

      // If segmentHitEpisode or podcastHitEpisode are both "", throw an error
      if (!segmentHitEpisode || !segmentHitPodcast) {
        throw Error("SegmentHitEpisode or SegmentHitPodcast is:");
      }

      // We are setting the first element to be container of last the hits since
      searchResponse.hits[0] = {
        id: segmentHit.id,
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
        subHits: initialSearchResponse.hits.flat(),
        belongsToTranscriptId: segmentHit.belongsToTranscriptId,
      };

      // Removing last the other hits as they were initilasty part of the .hits of the initialSearchResponse, but since they last share a common episodeGuid ID then I shoved them into the subHits.
      searchResponse.hits = [searchResponse.hits[0]];

      // Return the entire transcript
      return searchResponse;
    } else {
      // Perform initial search on the segmentsIndex to get the segments
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search("", {
        ...searchParams,
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="initialHightlight">',
        highlightPostTag: "</span>",
      });
      // Final ClientSearchResponse object
      let searchResponse: ClientSearchResponse = {
        query: searchParams.q || "",
        hits: [],
      };

      // MultiSearchQuery object
      let multiSearchParams: any = {
        queries: [],
      };

      // Create the queries for the multiSearch route on meilisearch
      initialSearchResponse.hits.forEach((segmentHit: SegmentHit) => {
        multiSearchParams.queries.push({
          indexUid: "segments", // Replace with the actual index name
          q: "",
          filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}' AND id != '${segmentHit.id}'`,
          limit: 50,
          sort: ["start:asc"],
          matchingStrategy: "all",
          segmentId: segmentHit.id,
          segmentHit: segmentHit,
        });
      });

      // Ids and filters
      const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToPodcastGuid}'`))];
      const podcastFilter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
      const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToEpisodeGuid}'`))];
      const episodeFilter: string = `episodeGuid=${episodeIds.join(" OR episodeGuid=")}`;

      // Adding extra queries
      multiSearchParams.queries.push(
        ...[
          {
            indexUid: "episodes",
            q: "",
            filter: episodeFilter,
            limit: SEGMENTS_TO_SEARCH,
          },
          {
            indexUid: "podcasts",
            q: "",
            filter: podcastFilter,
            limit: SEGMENTS_TO_SEARCH,
          },
        ]
      );

      // Declaring the Map<string, Hit> variables
      let podcastsMap: Map<string, PodcastHit> | "" = "";
      let episodesMap: Map<string, EpisodeHit> | "" = "";

      // Performing queries using promise awaitlast possibly faster
      const lastResponses: any = await Promise.all(
        multiSearchParams.queries.map(async (query: any) => {
          return {
            result: await meilisearchConnection.index(query.indexUid).search("", {
              q: query.q,
              filter: query.filter,
              limit: query.limit,
              sort: query.sort,
              matchingStrategy: query.matchingStrategy,
            }),
            indexUid: query.indexUid,
            segmentId: query.segmentId,
            segmentHit: query.segmentHit,
          };
        })
      );

      // last responses cached length
      const lastResponsesLength: number = lastResponses.length;

      // Found bools to avoid unnecessary looping
      let foundPodcast: boolean = false;
      let foundEpisode: boolean = false;

      // Creating podcastGuid->PodcastHit and episodeGuid->EpisodeHit Map
      for (let i = 0; i < lastResponsesLength; i++) {
        // Result var
        const { result, indexUid } = lastResponses[i];

        // Work
        if (indexUid === "podcasts" && !foundPodcast) {
          podcastsMap = new Map(result.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
          foundPodcast = true;
        } else if (indexUid === "episodes" && !foundEpisode) {
          episodesMap = new Map(result.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));
          foundEpisode = true;
        }
        if (foundEpisode && foundPodcast) break;
      }

      // If both are truthy we go further
      if (podcastsMap && episodesMap) {
        // We take last the multisearchResponses and construct a clientResponseObject
        for (let i = 0; i < lastResponsesLength; i++) {
          // Result var
          const { result, indexUid, segmentId, segmentHit } = lastResponses[i];

          // Skip if wrong index we already processed them further up
          if (indexUid === "podcasts" || indexUid === "episodes") continue;

          // Setting more readable vars
          const segmentPostHits: SegmentHit[] = result.hits;
          const segmentHitPodcast: PodcastHit = podcastsMap.get(segmentPostHits[0].belongsToPodcastGuid) as PodcastHit; // We can use the first one in the subhits because they last have the same podcastGuid
          const segmentHitEpisode: EpisodeHit = episodesMap.get(segmentPostHits[0].belongsToEpisodeGuid) as EpisodeHit;

          // We are setting the first element to be container of last the hits since
          const clientSearchResponseHit: ClientSearchResponseHit = {
            id: segmentId,
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
            subHits: [
              {
                text: segmentHit._formatted.text,
                start: segmentHit.start,
                end: segmentHit.end,
                id: segmentId,
              },
              ...convertSegmentHitToClientSegmentHit(segmentPostHits.flat()),
            ],
            belongsToTranscriptId: segmentPostHits[0].belongsToTranscriptId,
          };

          searchResponse.hits.push(clientSearchResponseHit);
        }

        // Before returning the response we need to sort the hits using some jaccard string similarity checks.
        for (let i = 0; i < searchResponse.hits.length; i++) {
          const searchResponseHit: ClientSearchResponseHit = searchResponse.hits[i];
          const miniSubHits: ClientSegmentHit[] = searchResponseHit.subHits.slice(0, 5);
          const concatenated: string = miniSubHits.map((clientSegmentHit: ClientSegmentHit) => clientSegmentHit.text).join(" ");
          searchResponseHit.similarity = this.calculateSimilarity(concatenated, searchParams.q || "");
        }
        // Sort them and then return them
        // @ts-ignore
        searchResponse.hits = searchResponse.hits.sort((a: ClientSearchResponseHit, b: ClientSearchResponseHit) => b.similarity - a.similarity);

        // Return that response
        return searchResponse as ClientSearchResponse;
      }
    }
    return {} as ClientSearchResponse;
  }

  private async searchPodcastsWithIds(podcastIds: string[]): Promise<PodcastResponse> {
    // Search the index
    podcastIds = podcastIds.map((e) => `'${e}'`);
    const filter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
    const resData: PodcastResponse = await this.podcastsIndex.search("", {
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
    const resData: EpisodeResponse = await this.episodesIndex.search("", {
      limit: episodesIds.length || 5,
      filter: filter,
    });
    // Return data
    return resData;
  }

  private calculateSimilarity(text: string, originalSearchString: string) {
    const n = 5; // Adjust the value of n for the desired n-gram length
    const originalNgrams = this.createNgrams(originalSearchString, n);
    const textNgrams = this.createNgrams(text, n);
    const windowSize = originalNgrams.length;

    if (windowSize === 0) return 0;

    let maxSimilarity = 0;

    for (let i = 0; i <= textNgrams.length - windowSize; i++) {
      const textWindow = textNgrams.slice(i, i + windowSize);
      const similarityScore = this.jaccardSimilarity(originalNgrams, textWindow);
      if (similarityScore > maxSimilarity) {
        maxSimilarity = similarityScore;
      }
    }

    return maxSimilarity;
  }

  private createNgrams(text: string, n: number): string[] {
    const ngrams = [];
    for (let i = 0; i <= text.length - n; i++) {
      //@ts-ignore
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

