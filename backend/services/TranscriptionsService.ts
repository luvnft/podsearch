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
import { TranscriptionResponse, TranscriptionResponseHit } from "types/TranscriptionResponse";

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
      matchingStrategy: searchQuery?.matchingStrategy || "all",
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
      // Perform initial search on the segme ntsIndex to get the segments
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
        subHits: initialSearchResponse.hits.flat(),
        belongsToTranscriptId: segmentHit.belongsToTranscriptId,
      };

      // Removing last the other hits as they were initilasty part of the .hits of the initialSearchResponse, but since they last share a common episodeGuid ID then I shoved them into the subHits.
      searchResponse.hits = [searchResponse.hits[0]];

      // Return the entire transcript
      return searchResponse;
    } else {
      // Final ClientSearchResponse object
      let searchResponse: ClientSearchResponse = {
        query: searchParams.q || "",
        hits: [],
      };

      // MultiSearchQuery object
      let multiSearchParams: any = {
        queries: [],
      };

      // First we search transcriptions to get the  ids of the belonging transcript
      const transcriptionSearchResponse: TranscriptionResponse = await this.transcriptionsIndex.search(searchParams.q, {
        q: searchParams.q,
        attributesToRetrieve: ["id"],
        limit: SEGMENTS_TO_SEARCH,
        matchingStrategy: searchParams.matchingStrategy || "last",
      });

      console.log("Number of transcriptions is: ", transcriptionSearchResponse.hits.length);

      //@ts-ignore We get the ids and construct a filter
      const transcriptionIds: string[] = [...new Set(transcriptionSearchResponse.hits.map((transcriptionSearchResponseHit: any) => `${transcriptionSearchResponseHit.id}`))];
      let transcriptionFilter: string = `belongsToTranscriptId=${transcriptionIds.join(" OR belongsToTranscriptId=")}`;
      const splittedSearchParams: string[] = searchParams.q?.split(" ") || [""];
      console.log("Number of transcriptionIds: ", transcriptionIds.length);
      console.log("The transcriptionfilter is: ", transcriptionFilter);

      // We perform initial search on the segmentsIndex to get the segments for a particular search q param with these transcriptionIds as filter
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(searchParams.q, {
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="initialHightlight">',
        highlightPostTag: "</span>",
        matchingStrategy: "last",
        filter: transcriptionFilter,
        limit: SEGMENTS_TO_SEARCH,
        q: searchParams.q,
      });
      // // We perform initial search on the segmentsIndex to get the segments for a particular search q param with these transcriptionIds as filter
      // let initialSearchResponse2: SegmentResponse = await this.segmentsIndex.search(searchParams.q?.split(" ").slice(1).join(" "), {
      //   attributesToHighlight: ["text"],
      //   highlightPreTag: '<span class="initialHightlight">',
      //   highlightPostTag: "</span>",
      //   matchingStrategy: "last",
      //   filter: transcriptionFilter,
      //   limit: SEGMENTS_TO_SEARCH,
      //   q: searchParams.q?.split(" ").slice(1).join(" "),
      // });

      const segmentHits: SegmentHit[] = [...initialSearchResponse.hits];
      const uniqueSegmentHits: SegmentHit[] = [...new Map(segmentHits.map((item) => [item.id, item])).values()];
      initialSearchResponse.hits = uniqueSegmentHits.slice(0, SEGMENTS_TO_SEARCH);

      // about meeting someone
      // Before returning the response we need to sort the hits using some jaccard string similarity checks.
      for (let i = 0; i < initialSearchResponse.hits.length; i++) {
        const segmentHit: SegmentHit = initialSearchResponse.hits[i];
        segmentHit.similarity = this.calculateSimilarity(segmentHit.text, searchParams.q || "");
      }

      // Sort them and then return them
      // @ts-ignore
      initialSearchResponse.hits = initialSearchResponse.hits.sort((a: SegmentHit, b: SegmentHit) => b.similarity - a.similarity);
      initialSearchResponse.hits = initialSearchResponse.hits.slice(0, SEGMENTS_TO_SEARCH);

      console.log("Number of segments returned is: ", initialSearchResponse.hits.length);

      // Create the queries for the multiSearch route on meilisearch
      initialSearchResponse.hits.forEach((segmentHit: SegmentHit) => {
        multiSearchParams.queries.push({
          indexUid: "segments",
          q: "",
          filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToTranscriptId = '${segmentHit.belongsToTranscriptId}' AND id != '${segmentHit.id}'`,
          limit: 50,
          sort: ["start:asc"],
          matchingStrategy: "last",
          segmentId: segmentHit.id,
          segmentHit: segmentHit,
        });
      });

      console.log("Number of queries inside multiSearchParams.queries: ", multiSearchParams.queries.length);

      // Ids and filters
      const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToPodcastGuid}'`))];
      const podcastFilter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
      const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToEpisodeGuid}'`))];
      const episodeFilter: string = `episodeGuid=${episodeIds.join(" OR episodeGuid=")}`;

      console.log("The Number of PodcastIds is: ", podcastIds.length);
      console.log("The number of episodeIds is: ", episodeIds.length);
      console.log("The podcastFilter is : ", podcastFilter);
      console.log("The episodesFilter is: ", episodeFilter);

      // Adding extra queries to multiparam object
      multiSearchParams.queries.push(
        ...[
          {
            indexUid: "episodes",
            filter: episodeFilter,
            limit: SEGMENTS_TO_SEARCH,
            q: "",
          },
          {
            indexUid: "podcasts",
            filter: podcastFilter,
            limit: SEGMENTS_TO_SEARCH,
            q: "",
          },
        ],
      );

      // Declaring the Map<string, Hit> variables
      let podcastsMap: Map<string, PodcastHit> | "" = "";
      let episodesMap: Map<string, EpisodeHit> | "" = "";

      const lastResponses: any = await Promise.all(
        multiSearchParams.queries.map(async (query: any) => {
          console.log("Filter is: ", query.filter);
          console.log("Limit is: ", query.limit);
          if (query.indexUid === "episodes") {
            console.log("Time for an episodes");
            return {
              result: await meilisearchConnection.index(query.indexUid).search(null, {
                q: null,
                filter: episodeFilter,
                limit: SEGMENTS_TO_SEARCH,
              }),
              indexUid: query.indexUid,
              segmentId: query.segmentId,
              segmentHit: query.segmentHit,
            };
          } else {
            return {
              result: await meilisearchConnection.index(query.indexUid).search(query.q, {
                q: query.q,
                filter: query.filter,
                limit: query.limit,
                sort: query.sort,
                matchingStrategy: query.matchingStrategy || "all",
              }),
              indexUid: query.indexUid,
              segmentId: query.segmentId,
              segmentHit: query.segmentHit,
            };
          }
        }),
      );

      // Found bools to avoid unnecessary looping
      let finishedWithPodcasts: boolean = false;
      let finishedWithEpisodes: boolean = false;

      // Creating podcastGuid->PodcastHit and episodeGuid->EpisodeHit Map
      for (let i = 0; i < lastResponses.length; i++) {
        // Result var
        const { result, indexUid } = lastResponses[i];
        console.log(i);

        // Work
        if (indexUid === "podcasts" && !finishedWithPodcasts) {
          podcastsMap = new Map(result.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
          finishedWithPodcasts = true;
        } else if (indexUid === "episodes" && !finishedWithEpisodes) {
          console.log("The size of the result.hits for the episodes is : ", result.hits.length);
          result.hits.forEach((episode: EpisodeHit, index: number) => {
            console.log("Index is: ", index, " and episodeGuid is: ", episode.episodeGuid);
          });
          console.log("These are all the episodeGuids for the segments gathered");

          episodesMap = new Map(result.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));
          finishedWithEpisodes = true;
        }
        if (finishedWithEpisodes && finishedWithPodcasts) break;
      }

      console.log("The size of the podcastsMap is: ", podcastsMap);
      console.log("The size of the episodesMap is: ", episodesMap);

      // If both are truthy we go further
      if (podcastsMap && episodesMap) {
        // We take last the multisearchResponses segments and construct a clientResponseObject
        for (let i = 0; i < lastResponses.length; i++) {
          // Result var
          const { result, indexUid, segmentId, segmentHit } = lastResponses[i];

          // Skip if wrong index we already them furthe r up
          if (indexUid === "podcasts" || indexUid === "episodes") {
            continue;
          }

          // Setting more readable vars
          const segmentPostHits: SegmentHit[] = result.hits;
          const segmentHitPodcast: PodcastHit | undefined = podcastsMap.get(segmentPostHits[0].belongsToPodcastGuid); // We can use the first one in the subhits because they have the same podcastGuid
          const segmentHitEpisode: EpisodeHit | undefined = episodesMap.get(segmentPostHits[0].belongsToEpisodeGuid);

          if (segmentHitEpisode === undefined) {
            console.log("We found a segment which has an episodeGuid which doesn't exist apparently");
            console.log(" The episodeGuid is:  ", result.hits[0].belongsToEpisodeGuid);
          }
          // We are setting the first element to be container of last the hits since
          const clientSearchResponseHit: ClientSearchResponseHit | any = {
            id: segmentId,
            podcastTitle: segmentHitPodcast?.title,
            episodeTitle: segmentHitEpisode?.episodeTitle,
            podcastSummary: segmentHitPodcast?.description,
            episodeSummary: segmentHitEpisode?.episodeSummary,
            description: segmentHitPodcast?.description,
            podcastAuthor: segmentHitPodcast?.itunesAuthor,
            episodeLinkToEpisode: segmentHitEpisode?.episodeLinkToEpisode,
            episodeEnclosure: segmentHitEpisode?.episodeEnclosure,
            podcastLanguage: segmentHitPodcast?.language,
            podcastGuid: segmentHitPodcast?.podcastGuid,
            podcastImage: segmentHitPodcast?.imageUrl,
            episodeGuid: segmentHitEpisode?.episodeGuid,
            url: segmentHitPodcast?.url,
            link: segmentHitPodcast?.link,
            youtubeVideoLink: segmentHitEpisode?.youtubeVideoLink || "",
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

          const someValueIsUndefined = Object.values(clientSearchResponseHit).some((value) => value === undefined);
          if (!someValueIsUndefined) searchResponse.hits.push(clientSearchResponseHit);
          else continue;
        }

        console.log("Leaved", searchResponse);

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
    const n = 10; // Adjust the value of n for the desired n-gram length
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
