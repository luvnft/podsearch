export interface PodcastResponse {
    hits: PodcastHit[];
    query: string;
    processingTimeMs: number;
    limit?: number | undefined;
    offset?: number | undefined;
    estimatedTotalHits?: number;
  }
  
  export interface PodcastHit {
    id: string
    url: string
    title: string
    link: string
    contentType: string
    originalUrl: string
    itunesAuthor: string
    itunesOwnerName: string
    itunesType: string
    generator: string
    language: string
    chash: string
    host: string
    category1: string
    category2: string
    category3: string
    category4: string
    category5: string
    category6: string
    category7: string
    category8: string
    category9: string
    category10: string
    imageUrl: string
    newestEnclosureUrl: string
    description: string
    podcastGuid: string
    explicit: number
    dead: number
    itunesId: number
    episodeCount: number
    lastHttpStatus: number
    popularityScore: number
    newestEnclosureDuration: number
    priority: number
    updateFrequency: number
    createdAt: string
    youtubeChannel: string
    indexed: boolean
  }
  