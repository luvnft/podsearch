import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { ClientSearchResponse, ClientSearchResponseHit, ClientSegmentHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _ from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchQuery, MultiSearchResponse, MultiSearchResult, SearchResponse } from "meilisearch";
import { EpisodeHit, EpisodeResponse } from "../types/EpisodeResponse";
import { PrismaClient } from "@prisma/client";
import { SearchQuery } from "../types/SearchQuery";
import { SearchParams } from "../types/SearchParams";

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
      attributesToHighlight: ["text"],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: "</span>",
      matchingStrategy: "last",
      q: searchQuery.searchString,
      filter: searchQuery.filter,
      limit: 12,
      offset: searchQuery.offset || 0,
    };

    // Modify mainQuery if we want a fullTranscript
    if (searchQuery.getFullTranscript) {
      mainQuery = {
        filter: searchQuery.filter,
        limit: 10000,
        q: "",
        matchingStrategy: "last",
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

      // Getting all ids for podcasts and episodes
      for (let i = 0; i < initialSearchResponseLength; i++) {
        podcastIdsSet.add(initialSearchResponse.hits[i].belongsToPodcastGuid);
        episodeIdsSet.add(initialSearchResponse.hits[i].belongsToEpisodeGuid);
      }

      // Get all podcasts and episodes based on initial request as the segmentIndex doesn't store them
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

      // We are setting the first element to be container of all the hits since
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

      // Removing all the other hits as they were initially part of the .hits of the initialSearchResponse, but since they all share a common episodeGuid ID then I shoved them into the subHits.
      searchResponse.hits = [searchResponse.hits[0]];

      // Return the entire transcript 
      return searchResponse;
    } else {
      // Perform initial search on the segmentsIndex to get the segments
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search("", searchParams);

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
          filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}'`,
          limit: 50,
          sort: ["start:asc"],
          attributesToHighlight: ["text"],
          highlightPreTag: '<span class="highlight">',
          highlightPostTag: "</span>",
          matchingStrategy: "last",
          segmentId: segmentHit.id,
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
            limit: 12,
          },
          {
            indexUid: "podcasts",
            q: "",
            filter: podcastFilter,
            limit: 12,
          },
        ]
      );

      // Declaring the Map<string, Hit> variables
      let podcastsMap: Map<string, PodcastHit> | "" = "";
      let episodesMap: Map<string, EpisodeHit> | "" = "";

      // Performing queries using promise awaitAll possibly faster
      const allResponses: any = await Promise.all(
        multiSearchParams.queries.map(async (query: any) => {
          const indexCopy: string = query.indexUid;
          const segmentIdCopy: string = query.segmentId;
          delete query.indexUid;
          delete query.segmentId;

          return {
            result: await meilisearchConnection.index(indexCopy).search("", query),
            indexUid: indexCopy,
            segmentId: segmentIdCopy,
          };
        })
      );

      // All responses cached length
      const allResponsesLength: number = allResponses.length;

      // Found bools to avoid unnecessary looping
      let foundPodcast: boolean = false;
      let foundEpisode: boolean = false;

      // Creating podcastGuid->PodcastHit and episodeGuid->EpisodeHit Map
      for (let i = 0; i < allResponsesLength; i++) {
        if (foundEpisode && foundPodcast) break;

        // Result var
        const { result, indexUid } = allResponses[i];

        // Work
        if (indexUid === "podcasts" && !foundPodcast) {
          podcastsMap = new Map(result.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
          foundPodcast = true;
        } else if (indexUid === "episodes" && !foundEpisode) {
          episodesMap = new Map(result.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));
          foundEpisode = true;
        }
      }

      // If both are truthy we go further
      if (podcastsMap && episodesMap) {
        // We take all the multisearchResponses and construct a clientResponseObject
        for (let i = 0; i < allResponsesLength; i++) {
          // Result var
          const { result, indexUid, segmentId } = allResponses[i];

          // Skip if wrong index we already processed them further up
          if (indexUid === "podcasts" || indexUid === "episodes") continue;

          // Setting more readable vars
          const segmentPostHits: SegmentHit[] = result.hits;
          const segmentHitPodcast: PodcastHit = podcastsMap.get(segmentPostHits[0].belongsToPodcastGuid) as PodcastHit;
          const segmentHitEpisode: EpisodeHit = episodesMap.get(segmentPostHits[0].belongsToEpisodeGuid) as EpisodeHit;

          // We are setting the first element to be container of all the hits since
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
            subHits: segmentPostHits.flat(),
            belongsToTranscriptId: segmentPostHits[0].belongsToTranscriptId,
          };

          searchResponse.hits.push(clientSearchResponseHit);
        }
        console.log("SSS", searchResponse)
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
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
