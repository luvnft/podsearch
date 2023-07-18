import { SearchResponse } from "~~/types/SearchResponse";
import { ApiService } from "./ApiService";

export default class TranscriptionService extends ApiService {
  public constructor() {
    super();
  }

  public async getNew(): Promise<SearchResponse> {
    const data = await this.fetch<SearchResponse>("/transcriptions/new", "GET");
    return data;
  }

  public async getTrending(): Promise<SearchResponse> {
    const data = await this.fetch<SearchResponse>("/transcriptions/trending", "GET");
    return data;
  }

  public async search(searchString: string): Promise<SearchResponse> {
    const data = await this.fetch<SearchResponse>("/transcriptions/search", "GET", { searchString });
    return data;
  }
}
