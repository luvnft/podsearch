export interface EpisodeResponse {
  hits: EpisodeHit[];
  query: string;
  processingTimeMs: number;
  limit?: number | undefined;
  offset?: number | undefined;
  estimatedTotalHits?: number;
}

export interface EpisodeHit {
  id: string;
  episodeAuthor: string;
  episodeTitle: string;
  episodeImage: string;
  episodeLinkToEpisode: string;
  episodeAuthors: string;
  episodeSummary: string;
  episodeEnclosure: string;
  episodeLanguage: string;
  podcastRssFeed: string;
  podcastAuthor: string;
  podcastSummary: string;
  podcastLanguage: string;
  podcastTitle: string;
  podcastGuid: string;
  podcastImage: string;
  episodeGuid: string;
  episodePublished: string;
  episodeDuration: number;
  processed: boolean;
  beingTranscribed: boolean;
  causedError: boolean;
  updatedAt: string;
  reAlignedWithBigModel: boolean;
  youtubeVideoLink?: string;
  highestSimilarityVideo: any;
  isRead: boolean;
  indexed: boolean;
}
