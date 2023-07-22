import { useSearchStore } from "store/searchStore";
const store = useSearchStore();

export default class ApiService {
  protected BASE_URL: string;

  protected constructor() {
    this.BASE_URL = "";
  }

  protected getBaseUrl() {
    return this.BASE_URL;
  }
}
