import { defineStore } from "pinia";
import { SearchQuery } from "../types/SearchQuery";
import { SearchResponse } from "types/SearchResponse";
import { RouteLocationNormalized } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";

const route: RouteLocationNormalized = useRoute();
const utils: Utils = useUtils();
export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const routeBasedQuery = utils.decodeQuery(route.query?.searchQuery);

  const query: SearchQuery = routeBasedQuery ? routeBasedQuery : searchQuery.value;
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: routeBasedQuery,
  });
  console.log("From pinia: ", searchQuery.value);
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);

  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
    searchResults,
  };
});
