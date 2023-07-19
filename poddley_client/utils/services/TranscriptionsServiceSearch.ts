import { SearchResponse } from "~~/types/SearchResponse";
import axios, { AxiosResponse } from "axios";

export default class TranscriptionsServiceSearch {
  protected BASE_URL: string;

  public constructor() {
    this.BASE_URL = "https://api.poddley.com" || "http://localhost:3000";
  }

  protected getBaseUrl(): string {
    return this.BASE_URL;
  }

  protected async fetch<T>(url: string, method: "GET" | "POST", params?: any): Promise<T> {
    console.log(this.getBaseUrl());
    const response: AxiosResponse = await axios({
      url: this.getBaseUrl() + url,
      method,
      params,
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
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
