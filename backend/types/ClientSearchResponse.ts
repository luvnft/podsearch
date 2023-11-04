export interface ClientSearchResponse {
  hits: ClientSearchResponseHit[];
  query: string;
}

export interface ClientSearchResponseHit {
  id: string; // This is segmentId
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
  subHits: ClientSegmentHit[];
  similarity?: number;
}

export interface ClientSegmentHit {
  text: string;
  id: string;
  start: number;
  end: number;
  startYoutube: number;
  endYoutube: number;
}
