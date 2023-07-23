import { defineStore } from "pinia";
import { SearchQuery } from "../types/SearchQuery";
import { SearchResponse } from "types/SearchResponse";

export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
  });
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
