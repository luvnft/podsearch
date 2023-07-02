import { SearchResponse } from "~~/types/SearchResponse";
import ApiService from "./ApiService";
import { SearchQuery } from "types/SearchQuery";

export default class TranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async getNew(): Promise<SearchResponse> {
    const res = await useFetch("/transcriptions/new", {
      method: "GET",
      baseURL: this.BASE_URL,
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }

  public async getTrending(): Promise<SearchResponse> {
    const res = await useFetch("/transcriptions/trending", {
      method: "GET",
      baseURL: this.BASE_URL,
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }

  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const res = await useFetch("/transcriptions/search", {
      method: "GET",
      baseURL: this.BASE_URL,
      query: {
        searchQuery: searchQuery,
      },
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }
}
