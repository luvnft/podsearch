export interface SegmentResponse {
  hits: SegmentHit[];
  query: string;
  processingTimeMs: number;
  limit?: number | undefined;
  offset?: number | undefined;
  estimatedTotalHits?: number;
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
  indexed: boolean;
  segmentWordEntries: any;
  _formatted: Formatted;
  similarity: number;
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
  segmentWordEntries: any;
}