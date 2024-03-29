import type { ClientSearchResponse } from "../../types/ClientSearchResponse";
import ApiService from "./ApiService";
import type { SearchQuery } from "../../types/SearchQuery";

export default class TranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async search(searchQuery: SearchQuery): Promise<ClientSearchResponse> {
    console.log("Doing query: ", searchQuery);
    const res = await useFetch<ClientSearchResponse>("/transcriptions/search", {
      method: "POST",
      baseURL: this.API_BASE_URL,
      body: { searchQuery },
    });
    const data: ClientSearchResponse = res.data.value as ClientSearchResponse;
    return data;
  }
}
