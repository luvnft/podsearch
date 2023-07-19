export interface SearchResponse {
  hits: Hit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export interface Hit {
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
  imageUrl: string;
  episodeGuid: string;
  url: string;
  link: string;
  youtubeVideoLink?: string;
  deviationTime?: number;
  id: string;
  _formatted: Formatted;
}

export interface Formatted {
  podcastTitle: string;
  episodeTitle: string;
  podcastSummary: string;
  episodeSummary: string;
  description: string;
  text: string;
  podcastAuthor: string;
  belongsToTranscriptId: string;
  start: string;
  end: string;
  episodeLinkToEpisode: string;
  episodeEnclosure: string;
  podcastLanguage: string;
  podcastGuid: string;
  imageUrl: string;
  episodeGuid: string;
  url: string;
  link: string;
}

interface Cache {
  [key: number]: SearchResponse;
}
