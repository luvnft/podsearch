import axios, { AxiosResponse } from "axios";
import { SearchQuery } from "../../types/SearchQuery";

export default class TranscriptionsServiceSearch {
  protected BASE_URL: string;

  public constructor() {
    this.BASE_URL = "https://api.poddley.com" || "http://localhost:3000";
  }

  protected getBaseUrl(): string {
    return this.BASE_URL;
  }

  protected async fetchPost<T>(url: string, searchQuery: SearchQuery): Promise<T> {
    const response: AxiosResponse = await axios({
      url: this.getBaseUrl() + url,
      method: "POST",
      data: { searchQuery },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }
  public async search(searchQuery: SearchQuery): Promise<any> {
    console.log("Sending query: ", searchQuery);
    const data = await this.fetchPost<any>("/transcriptions/search", searchQuery);
    return data;
  }
}
