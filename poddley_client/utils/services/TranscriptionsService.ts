import { SearchResponse } from "~~/types/SearchResponse";
import ApiService from "./ApiService";

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

  public async search(searchString: string): Promise<SearchResponse> {
    const res = await useFetch("/transcriptions/search", {
      method: "GET",
      baseURL: this.BASE_URL,
      query: {
        searchString: searchString,
      },
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }
}
