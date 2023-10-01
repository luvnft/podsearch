export interface SearchQuery {
  offset: number;
  searchString: string | undefined;
  sort?: string[];
  filter?: string;
  limit?: number;
  facets?: string[];
  attributesToRetrieve?: string[];
  hitsPerPage?: number;
  page?: number;
  category?: string;
  attributesToHighlight: string[];
  highlightPreTag: string;
  highlightPostTag: string;
  showMatchesPosition: boolean;
  matchingStrategy: string;
}

export enum Category {
  PODCAST = "podcast",
  QUOTE = "quote",
  EPISODE = "episode"
}