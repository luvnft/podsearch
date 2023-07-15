import { SearchResponse } from "~~/types/SearchResponse";
import axios, { AxiosInstance } from "axios";
import ApiService from "./ApiService";

export default class TranscriptionService extends ApiService {
  private apiClient: AxiosInstance;

  public constructor() {
    super();
    this.apiClient = axios.create({
      baseURL: this.BASE_URL,
    });
  }

  public async getNew(): Promise<SearchResponse> {
    const res = await this.apiClient.get("/transcriptions/new");
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }

  public async getTrending(): Promise<SearchResponse> {
    const res = await this.apiClient.get("/transcriptions/trending");
    const data: SearchResponse = res.data.value as SearchResponse;
    return data;
  }

  public async search(searchString: string): Promise<any> {
    const res = await this.apiClient.get("transcriptions/search", {
      params: {
        searchString: searchString,
      },
    });
    const data: SearchResponse = res.data as SearchResponse;
    return data;
  }
}
