export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
    this.BASE_URL = useRuntimeConfig().public.baseURL;
  }

  protected getBaseUrl() {
    return this.BASE_URL;
  }
}
