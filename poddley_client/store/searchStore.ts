import { defineStore } from "pinia";
import { SearchResponse } from "types/SearchResponse";
import { SearchQuery } from "../types/SearchQuery";
export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
  });
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const setSearchResults = (searchResponse: SearchResponse) => searchResults.value = searchResponse;
  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
    setSearchResults,
    searchResults,
  };
});
