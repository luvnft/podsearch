export interface TranscriptionResponse {
  hits: TranscriptionResponseHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export interface TranscriptionResponseHit {
  id: string;
  belongsToPodcastGuid: string;
  belongsToEpisodeGuid: string;
}
