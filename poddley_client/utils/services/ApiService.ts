import axios, { AxiosResponse } from "axios";
import { SearchResponse } from "~/types/SearchResponse";

export abstract class ApiService {
  protected BASE_URL: string;

  protected constructor() {
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
}
