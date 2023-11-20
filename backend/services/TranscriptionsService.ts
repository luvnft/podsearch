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
import { MultiSearchQueryType } from "types/MultiSearchQueryType";

const SEGMENTS_TO_SEARCH: number = 16;

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
    console.log("Received searchQuery: ", searchQuery);
    let mainQuery: SearchParams = {
      matchingStrategy: searchQuery?.matchingStrategy || "all",
      q: searchQuery.searchString,
      filter: searchQuery.filter,
      limit: SEGMENTS_TO_SEARCH,
      offset: searchQuery.offset,
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
      const subHitsArr = initialSearchResponse.hits.flat();
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
        subHits: subHitsArr.filter((segmentHit: SegmentHit) => !segmentHit.isYoutube),
        youtubeSubHits: subHitsArr.filter((segmentHit: SegmentHit) => segmentHit.isYoutube),
        belongsToTranscriptId: segmentHit.belongsToTranscriptId,
        isYoutube: segmentHit.isYoutube,
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
      let multiSearchParams: MultiSearchQueryType[] = [];

      // We perform initial search on the segmentsIndex to get the segments for a particular search q param
      let initialSearchResponse: SegmentResponse = await this.segmentsIndex.search(searchParams.q, {
        attributesToHighlight: ["text"],
        highlightPreTag: '<span class="initialHightlight">',
        highlightPostTag: "</span>",
        matchingStrategy: searchParams.matchingStrategy || "last",
        limit: SEGMENTS_TO_SEARCH,
        q: searchParams.q,
        offset: searchParams.offset,
      });

      // Create the queries for the multiSearch route on meilisearch
      initialSearchResponse.hits.forEach((segmentHit: SegmentHit) => {
        multiSearchParams.push({
          query: {
            q: "",
            filter: `start ${segmentHit.start} TO ${segmentHit.start + 300} AND belongsToEpisodeGuid = '${segmentHit.belongsToEpisodeGuid}' AND id != ${segmentHit.id}`,
            limit: 50,
            sort: ["start:asc"],
            matchingStrategy: "last",
          },
          segmentId: segmentHit.id,
          segmentHit: segmentHit,
          indexUid: "segments",
        });
      });

      // Ids and filters
      const podcastIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToPodcastGuid}'`))];
      const podcastFilter: string = `podcastGuid=${podcastIds.join(" OR podcastGuid=")}`;
      const episodeIds: string[] = [...new Set(initialSearchResponse.hits.map((hit: SegmentHit) => `'${hit.belongsToEpisodeGuid}'`))];
      const episodeFilter: string = `episodeGuid=${episodeIds.join(" OR episodeGuid=")}`;

      // Adding extra queries to multiparam object
      multiSearchParams.push(
        ...[
          {
            query: {
              filter: episodeFilter,
              limit: episodeIds.length,
              q: "", // This is very important, we need the placeholder search to be an empty string because empty string exists in all strings, null and undefiend will not work for some reason, meilisearch has some strange behaviour at some sections, it's been frequencly reported
            },
            indexUid: "episodes",
          },
          {
            query: {
              filter: podcastFilter,
              limit: podcastIds.length,
              q: "",
            },
            indexUid: "podcasts",
          },
        ],
      );

      // Declaring the Map<string, Hit> variables
      let podcastsMap: Map<string, PodcastHit> | "" = "";
      let episodesMap: Map<string, EpisodeHit> | "" = "";

      // First we process the podcast and episodes
      const lastResponses: any = await Promise.all(
        multiSearchParams.map(async (query: MultiSearchQueryType) => {
          if (query.indexUid === "podcasts" || query.indexUid === "episodes") {
            return {
              result: await meilisearchConnection.index(query.indexUid).search(query.query.q, {
                ...query.query,
              }),
              indexUid: query.indexUid,
              segmentId: query.segmentId,
              segmentHit: query.segmentHit,
            };
          } else if (query.indexUid === "segments") {
            return {
              result: await meilisearchConnection.index(query.indexUid).search(query.query.q, {
                ...query.query,
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

        // Work
        if (indexUid === "podcasts" && !finishedWithPodcasts) {
          podcastsMap = new Map(result.hits.map((podcast: PodcastHit) => [podcast.podcastGuid, podcast]));
          finishedWithPodcasts = true;
        } else if (indexUid === "episodes" && !finishedWithEpisodes) {
          episodesMap = new Map(result.hits.map((episode: EpisodeHit) => [episode.episodeGuid, episode]));
          finishedWithEpisodes = true;
        }
        if (finishedWithEpisodes && finishedWithPodcasts) break;
      }

      // If both are truthy we go further
      if (podcastsMap && episodesMap) {
        // We take last the multisearchResponses segments and construct a clientResponseObject
        for (let i = 0; i < lastResponses.length; i++) {
          // Result var
          const {
            result,
            indexUid,
            segmentId,
            segmentHit,
          }: {
            result: any;
            indexUid: string;
            segmentId: string;
            segmentHit: SegmentHit;
          } = lastResponses[i];

          // Skip if wrong index we already them further up
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
          console.log("SegmentHit is : ", segmentHit);
          const segmentHitsArr = segmentPostHits.flat();

          const subHitsCondition = segmentHit.text === segmentHitsArr.filter((segmentHit) => !segmentHit.isYoutube)[0].text;
          const subHitsArray = subHitsCondition ? [
            {
              text: segmentHit._formatted.text,
              id: segmentHit.id,
              start: segmentHit.start,
              end: segmentHit.end,
              isYoutube: segmentHit.isYoutube,
            },
            ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => !segmentHit.isYoutube).slice(1))
          ] : [
            {
              text: segmentHit._formatted.text,
              id: segmentHit.id,
              start: segmentHit.start,
              end: segmentHit.end,
              isYoutube: segmentHit.isYoutube,
            },
            ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => !segmentHit.isYoutube))
          ]

          const youtubeSubHitsCondition = segmentHit.text === segmentHitsArr.filter((segmentHit) => segmentHit.isYoutube)[0].text;
          const youtubeSubHitsArray = youtubeSubHitsCondition ? [
            {
              text: segmentHit._formatted.text,
              id: segmentHit.id,
              start: segmentHit.start,
              end: segmentHit.end,
              isYoutube: segmentHit.isYoutube,
            },
            ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => segmentHit.isYoutube).slice(1))
          ] : [
            {
              text: segmentHit._formatted.text,
              id: segmentHit.id,
              start: segmentHit.start,
              end: segmentHit.end,
              isYoutube: segmentHit.isYoutube,
            },
            ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => segmentHit.isYoutube))
          ]

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
            subHits: [...subHitsArray, ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => !segmentHit.isYoutube))],
            youtubeSubHits: [...youtubeSubHitsArray, ...convertSegmentHitToClientSegmentHit(segmentHitsArr.filter((segmentHit) => segmentHit.isYoutube))],
            belongsToTranscriptId: segmentPostHits[0].belongsToTranscriptId,
          };

          const someValueIsUndefined = Object.values(clientSearchResponseHit).some((value) => value === undefined);
          if (!someValueIsUndefined) searchResponse.hits.push(clientSearchResponseHit);
          else continue;
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

        const uniqueEpisodeGuids: Set<string> = new Set();
        // Filter hits to only include unique episodeGuids
        const uniqueHits = searchResponse.hits.filter((hit: ClientSearchResponseHit) => {
          if (uniqueEpisodeGuids.has(hit.episodeGuid)) {
            // If episodeGuid already exists in the Set, filter it out
            return false;
          } else {
            // If episodeGuid is new, add it to the Set and keep the hit
            uniqueEpisodeGuids.add(hit.episodeGuid);
            return true;
          }
        });

        // Now uniqueHits contains only unique hits based on episodeGuid
        searchResponse.hits = uniqueHits;

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
    const n = 3; // Adjust the value of n for the desired n-gram length
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
