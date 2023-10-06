import meilisearchConnection from "../other/meilisearchConnection";
import prismaConnection from "../other/prismaConnection";
import { ClientSearchResponse, ClientSearchResponseHit, ClientSegmentHit } from "../types/SearchResponse";
import { SegmentResponse, SegmentHit } from "../types/SegmentResponse";
import { PodcastResponse, PodcastHit } from "../types/PodcastResponse";
import _ from "lodash";
import { Index, MeiliSearch, MultiSearchParams, MultiSearchResponse, MultiSearchResult } from "meilisearch";
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
        q: undefined,
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
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(undefined, searchParams);

      // Final ClientSearchResponse object
      let searchResponse: ClientSearchResponse = {
        query: searchParams.q || undefined,
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

      // If segmentHitEpisode or podcastHitEpisode are both undefined, throw an error
      if (!segmentHitEpisode || !segmentHitPodcast) {
        throw Error("SegmentHitEpisode or SegmentHitPodcast is undefined");
      }

      // We are setting the first element to be container of all the hits since
      searchResponse.hits[0] = {
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
      }

      // Removing all the other hits:
      searchResponse.hits = [searchResponse.hits[0]]

      // Return the entire transcript
      return searchResponse;
    }
    else {
      // Perform initial search on the segmentsIndex to get the segments
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(undefined, searchParams);

      // Final ClientSearchResponse object
      let searchResponse: ClientSearchResponse = {
        query: searchParams.q || undefined,
        hits: [],
      };

      // MultiSearchQuery object
      let multiSearchParams: MultiSearchParams = {
        queries: [],
      };

      // Create the queries for the multiSearch route on meilisearch
      initialSearchResponse.hits.map((segmentHit: SegmentHit) => {
        multiSearchParams.queries.push({
          indexUid: "segments", // Replace with the actual index name
          q: undefined,
          filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}'`,
          limit: 50,
          sort: ["start:asc"],
          attributesToHighlight: ["text"],
          highlightPreTag: '<span class="highlight">',
          highlightPostTag: "</span>",
          matchingStrategy: "last",
        });
      });

      // Getting the podcast ids and episode ids to fetch them further as they are not part of the segmentObjects on the segmentsIndex
      const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToPodcastGuid))]
      const podcastFilter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;

      const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => hit.belongsToEpisodeGuid))]
      const episodesFilter: string = `episodeGuid=${episodeIds.join(" OR episodeGuid=")}`;

      // Add podcast query to multiQuery arr
      multiSearchParams.queries.push({
        indexUid: "podcasts",
        q: undefined,
        filter: podcastFilter,
      });
      // Add episode query to multiQuery arr
      multiSearchParams.queries.push({
        indexUid: "episodes",
        q: undefined,
        filter: episodesFilter,
      });

      // Declaring the Map<string, Hit> variables
      let podcastsMap;
      let episodesMap;

      // Performing the multiSearch query
      let multiSearchResponse: MultiSearchResponse = await meilisearchConnection.multiSearch(multiSearchParams);

      // Found bools to avoid unnecessary loopin
      let foundPodcast: boolean = false;
      let foundEpisode: boolean = false;

      // Creating podcastGuid->PodcastHit and episodeGuid->EpisodeHit Map
      for (let i = 0; i < multiSearchResponse.results.length; i++) {
        if (foundEpisode && foundPodcast) break;

        const result: MultiSearchResult<any> = multiSearchResponse.results[i]
        if (result.indexUid === "podcasts" && !foundPodcast) {
          podcastsMap = new Map(result.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
          foundPodcast = true;
          multiSearchResponse.results.splice(i, 1);
        }
        else if (result.indexUid === "episodes" && !foundEpisode) {
          episodesMap = new Map(result.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));
          foundEpisode = true;
          multiSearchResponse.results.splice(i, 1);
        }
      }

      // If both are truthy we go further
      if (podcastsMap && episodesMap) {
        for (let i = 0; i < multiSearchResponse.results.length; i++) {
          const result: MultiSearchResult<any> = multiSearchResponse.results[i];
          const segmentPostHits: SegmentHit[] = result.hits;
          const segmentPostHitFirst: SegmentHit = result.hits[0];
          const segmentHitPodcast: PodcastHit | undefined = podcastsMap.get(segmentPostHitFirst.belongsToPodcastGuid)
          const segmentHitEpisode: EpisodeHit | undefined = episodesMap.get(segmentPostHitFirst.belongsToEpisodeGuid)

          // If segmentHitEpisode or podcastHitEpisode are both undefined, throw an error
          if (!segmentHitEpisode || !segmentHitPodcast) {
            throw Error("SegmentHitEpisode or SegmentHitPodcast is undefined");
          }

          // We are setting the first element to be container of all the hits since
          const clientSearchResponseHit: ClientSearchResponseHit = {
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
            belongsToTranscriptId: segmentPostHitFirst.belongsToTranscriptId,
          }

          searchResponse.hits.push(clientSearchResponseHit);
        }

        return searchResponse;
      }
      else {
        throw Error("OopsieDaisy");
      }
    }
  }

  private async searchPodcastsWithIds(podcastIds: string[]): Promise<PodcastResponse> {
    // Search the index
    podcastIds = podcastIds.map((e) => `'${e}'`);
    const filter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
    const resData: PodcastResponse = await this.podcastsIndex.search(undefined, {
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
    const resData: EpisodeResponse = await this.episodesIndex.search(undefined, {
      limit: episodesIds.length || 5,
      filter: filter,
    });
    // Return data
    return resData;
  }
}

// Exporting the TranscriptionService as a class to avoid needing to create it everytime importing it somewhere
export default TranscriptionsService;
