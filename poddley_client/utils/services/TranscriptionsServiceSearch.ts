import axios, { AxiosResponse } from "axios";
import { SearchQuery } from "../../types/SearchQuery";
import { SearchResponse } from "../../types/SearchResponse";

export default class TranscriptionsServiceSearch {
  protected readonly BASE_URL = "https://api.poddley.com";

  protected async fetchPost<T>(apiUrl: string, requestData: any): Promise<T> {
    const response: AxiosResponse = await axios({
      url: this.BASE_URL + apiUrl,
      method: "POST",
      data: requestData,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  public async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    console.log("Searching from api srrr");
    console.log(searchQuery)
    const data = this.fetchPost<any>("/transcriptions/search", { searchQuery });
    console.log("DATA:", data);
    return data;
  }

  public async getFullTranscript(episodeGuid: string): Promise<SearchResponse> {
    return this.fetchPost<SearchResponse>("/transcriptions/get-full-transcript", { episodeGuid });
  }
}
