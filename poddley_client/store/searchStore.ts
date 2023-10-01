import { defineStore } from "pinia";
import { SearchResponse } from "types/SearchResponse";
import { SearchQuery } from "../types/SearchQuery";
export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
    offset: 0,
  });

  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const setSearchResults = (searchResponse: SearchResponse) => {
    if (searchResponse.query === searchQuery.value.searchString) {
      searchResults.value.hits = searchResults.value.hits.concat(searchResponse.hits);
    } else {
      searchResults.value = searchResponse;
    }
  };
  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
    setSearchResults,
    searchResults,
  };
});
