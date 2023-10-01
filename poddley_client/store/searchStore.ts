import { defineStore } from "pinia";
import { SearchResponse } from "types/SearchResponse";
import { SearchQuery } from "../types/SearchQuery";
import { Utils, useUtils } from "../composables/useUtils";
const utils: Utils = useUtils();

export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
    offset: 0,
  });

  const previousSearchQuery: Ref<string> = ref("");
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const setSearchResults = (searchResponse: SearchResponse) => {
    console.log("SearchResponse.query: ", searchResponse.query);
    console.log("SearchQuery.value.searchstring: ", searchQuery.value.searchString);
    if (searchResponse.query === previousSearchQuery.value) {
      searchResults.value.hits = utils.removeDuplicates([...searchResults.value.hits, ...searchResponse.hits], "id");
      console.log(searchResults.value.hits);
    } else {
      searchResults.value = searchResponse;
    }

    previousSearchQuery.value = searchQuery.value.searchString || "";
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
