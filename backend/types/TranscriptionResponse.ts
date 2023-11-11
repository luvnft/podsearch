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
  _matchesPosition: MatchesPositions;
}

export interface MatchesPositions {
  transcription: TranscriptionMatch[];
}

export interface TranscriptionMatch {
  start: number;
  length: number;
}
