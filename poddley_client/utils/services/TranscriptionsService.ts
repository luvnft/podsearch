import { SearchResponse } from "~~/types/SearchResponse";
import ApiService from "./ApiService";
import { SearchQuery } from "types/SearchQuery";

export default class TranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    console.log("Now making a search for: ", searchQuery);
    console.log("The BASE_URL: ", this.BASE_URL)
    const res = await useFetch("/transcriptions/search", {
      method: "POST",
      baseURL: this.BASE_URL,
      body: { searchQuery },
    });
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }
}
