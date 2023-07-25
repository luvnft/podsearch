export interface SearchQuery {
  searchString?: string;
  sort?: string[];
  filter?: string;
  limit?: number;
  hitsPerPage?: number;
  page?: number;
}