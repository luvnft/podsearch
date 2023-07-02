export interface SearchQuery {
    searchString: string;
    type: SearchType;
}

type SearchType = "segment" | "transcription";