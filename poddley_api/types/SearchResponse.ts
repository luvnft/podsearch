export interface SearchResponse {
  hits: SearchResponseHit[];
  query: string;
  processingTimeMs: number;
  limit?: number | undefined;
  offset?: number | undefined;
  estimatedTotalHits?: number;
}

export interface SearchResponseHit {
  id: string;
  podcastTitle: string;
  episodeTitle: string;
  podcastSummary: string;
  episodeSummary: string;
  description: string;
  text: string;
  podcastAuthor: string;
  belongsToTranscriptId: string;
  start: number;
  end: number;
  episodeLinkToEpisode: string;
  episodeEnclosure: string;
  podcastLanguage: string;
  podcastGuid: string;
  podcastImage: string;
  episodeGuid: string;
  url: string;
  link: string;
  similarity: number;
  youtubeVideoLink: string;
  deviationTime: number;
  imageUrl: string;
  _formatted: any;
}

export interface Formatted {
  text: string;
}
