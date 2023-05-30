import { SearchResponse } from "~~/types/SearchResponse";
import ApiService from "./ApiService";
export default class TranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async search(searchString: string): Promise<SearchResponse> {
    const res = await useFetch("/transcriptions", {
      method: "GET",
      query: {
        searchString: searchString,
      },
      baseURL: this.BASE_URL,
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }

  public async getTrendingQuotes(): Promise<SearchResponse> {
    const res = await useFetch("/trendingQuotes", {
      method: "GET",
      baseURL: this.BASE_URL,
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }
}
