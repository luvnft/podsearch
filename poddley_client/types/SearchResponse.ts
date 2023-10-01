export interface SearchResponse {
  hits: Hit[];
  query: string;
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
  podcastImage: string;
  episodeGuid: string;
  url: string;
  link: string;
  youtubeVideoLink?: string;
  deviationTime?: number;
  id: string;
  _formatted: Formatted;
  subHits: SegmentHit[];
}

export interface SegmentHit {
  text: string;
  id: string;
  start: number;
  end: number;
  language: string;
  belongsToPodcastGuid: string;
  belongsToEpisodeGuid: string;
  belongsToTranscriptId: string;
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