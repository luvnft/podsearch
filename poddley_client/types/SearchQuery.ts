export interface SearchQuery {
  searchString: string | null;
  sort?: string[];
  filter?: string;
  limit?: number;
  hitsPerPage?: number;
  offset?: number;
  getFullTranscript?: boolean;
}
export enum Category {
  EPISODE = "episode",
  PODCAST = "podcast",
  QUOTE = "quote"
}