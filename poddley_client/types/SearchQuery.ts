export interface SearchQuery {
  searchString?: string;
  sort?: string[];
  filter?: string;
  limit?: number;
  hitsPerPage?: number;
  offset?: number;
}
export enum Category {
  EPISODE = "episode",
  PODCAST = "podcast",
  QUOTE = "quote"
}