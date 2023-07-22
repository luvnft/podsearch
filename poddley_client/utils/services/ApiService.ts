export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
    this.BASE_URL = "https://api.poddley.com";
  }

  protected getBaseUrl() {
    return this.BASE_URL;
  }
}
