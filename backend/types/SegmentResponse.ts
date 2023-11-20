export interface SegmentResponse {
  hits: SegmentHit[];
  query: string;
  processingTimeMs: number;
  limit?: number | undefined;
  offset?: number | undefined;
  estimatedTotalHits?: number;
  isYoutube?: boolean;
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
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
  isYoutube: boolean;
  _formatted: any;
}
