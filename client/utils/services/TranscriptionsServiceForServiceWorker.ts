import axios, { type AxiosResponse } from "axios";
import type { SearchQuery } from "../../types/SearchQuery";
import type { ClientSearchResponse } from "../../types/ClientSearchResponse";

export default class TranscriptionsServiceForServiceWorker {
    protected readonly API_BASE_URL = "https://api.poddley.com";

    protected async fetchPost<T>(apiUrl: string, requestData: any): Promise<T> {
        const response: AxiosResponse = await axios({
            url: this.API_BASE_URL + apiUrl,
            method: "POST",
            data: requestData,
        });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
    }

    public async search(searchQuery: SearchQuery): Promise<ClientSearchResponse> {
        
        
        const data = this.fetchPost<any>("/transcriptions/search", { searchQuery });
        
        return data;
    }
}
