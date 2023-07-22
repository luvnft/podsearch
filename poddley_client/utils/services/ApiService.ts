export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
    this.BASE_URL = globalThis.env.NUXT_API_BASE_URL || "";
  }

  protected getBaseUrl() {
    return this.BASE_URL;
  }
}
