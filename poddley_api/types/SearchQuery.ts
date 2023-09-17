export interface SearchQuery {
  searchString: string | undefined;
  sort?: string[];
  filter?: string;
  limit?: number;
  facets?: string[];
  attributesToRetrieve?: string[];
  showMatchesPosition?: boolean;
  hitsPerPage?: number;
  page?: number;
  category?: string;
}
