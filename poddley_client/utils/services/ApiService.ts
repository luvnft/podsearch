export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
    this.BASE_URL = globalThis.__env__.LUKA || "";
  }

  protected getBaseUrl() {
    return this.BASE_URL;
  }
}
