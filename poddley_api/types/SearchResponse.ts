export interface SearchResponse {
  hits: Hit[];
  query: string;
  processingTimeMs: number;
  limit?: number | undefined;
  offset?: number | undefined;
  estimatedTotalHits?: number;
}

export interface Hit {
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
  podcastImage: string;
  episodeGuid: string;
  url: string;
  link: string;
}
