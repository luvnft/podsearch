import { defineStore } from "pinia";
import type { ClientSearchResponse } from "../types/ClientSearchResponse";
import type { SearchQuery } from "../types/SearchQuery";
const utils: Utils = useUtils();

export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
    offset: 0,
    matchingStrategy: "last",
  });

  const previousSearchString: Ref<string> = ref("");
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<ClientSearchResponse> = ref({} as ClientSearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const setSearchResults = (searchResponse: ClientSearchResponse) => {
    if (searchResponse.query === previousSearchString.value) {
      searchResults.value.hits = utils.removeDuplicates([...searchResults.value.hits, ...searchResponse.hits], "id");
    } else {
      searchResults.value = searchResponse;
    }

    previousSearchString.value = searchQuery.value.searchString || "";
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
