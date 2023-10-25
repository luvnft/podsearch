export default class ApiService {
  protected API_BASE_URL: string;

  protected constructor() {
    this.API_BASE_URL = useRuntimeConfig().public.baseURL;
  }
}
