export default class ApiService {
  protected API_BASE_URL: string;

  protected constructor() {
    this.API_BASE_URL = process.env.API_BASE_URL as string;
  }

  protected getBaseUrl() {
    return this.API_BASE_URL;
  }
}
