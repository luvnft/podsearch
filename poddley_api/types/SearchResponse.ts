import { SegmentHit } from "./SegmentResponse";

export interface SearchResponse {
  hits: SearchResponseHit[];
  query: string;
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
  _formatted?: Formatted;
  _matchesPosition?: MatchesPosition;
  subHits?: SegmentHit[];
}
 
export interface MatchesPosition {
  text: Text[];
}

export interface Formatted {
  text: string;
  id: string;
  start: string;
  end: string;
  language: string;
  belongsToPodcastGuid: string;
  belongsToEpisodeGuid: string;
  belongsToTranscriptId: string;
  indexed: boolean;
  segmentWordEntries: null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Formatted {
  text: string;
}
