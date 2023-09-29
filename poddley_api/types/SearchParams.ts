import { Query, Pagination, Highlight, Crop, Filter, MatchingStrategies } from "meilisearch";

export type SearchParams = Query &
  Pagination &
  Highlight &
  Crop & {
    filter?: Filter;
    sort?: string[];
    facets?: string[];
    attributesToRetrieve?: string[];
    showMatchesPosition?: boolean;
    matchingStrategy?: MatchingStrategies;
    hitsPerPage?: number;
    page?: number;
    facetName?: string;
    facetQuery?: string;
    vector?: number[] | null;
    showRankingScore?: boolean;
    showRankingScoreDetails?: boolean;
    attributesToSearchOn?: string[] | null;
    getFullTranscript?: boolean;
  };
