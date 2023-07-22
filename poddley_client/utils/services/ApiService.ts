export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
      this.BASE_URL = useAppConfig().public.baseURL;
  }

  protected getBaseUrl() {
      return this.BASE_URL;
  }
}