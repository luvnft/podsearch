export interface ClientSearchResponse {
  hits: ClientSearchResponseHit[];
  query: string | undefined;
}

export interface ClientSearchResponseHit {
  podcastTitle: string;
  episodeTitle: string;
  podcastSummary: string;
  episodeSummary: string;
  description: string;
  podcastAuthor: string;
  belongsToTranscriptId: string;
  episodeLinkToEpisode: string;
  episodeEnclosure: string;
  podcastLanguage: string;
  podcastGuid: string;
  podcastImage: string;
  episodeGuid: string;
  url: string;
  link: string;
  youtubeVideoLink?: string;
  deviationTime?: number;
  subHits: ClientSegmentHit[];
}

export interface ClientSegmentHit { 
  text: string;
  id: string;
  start: number;
  end: number;
  formatted?: string;
}
