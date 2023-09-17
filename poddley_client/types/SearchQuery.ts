export interface SearchQuery {
  searchString?: string;
  sort?: string[];
  filter?: string;
  limit?: number;
  hitsPerPage?: number;
  page?: number;
  category?: Category;
}

export enum Category {
  EPISODE = "episode",
  PODCAST = "podcast",
  QUOTE = "quote"
}