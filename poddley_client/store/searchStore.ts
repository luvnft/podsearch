import { defineStore } from "pinia";
import { SearchResponse } from "types/SearchResponse";
import { Category, SearchQuery } from "../types/SearchQuery";
export const useSearchStore = defineStore("searchStore", () => {
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
    category: Category.QUOTE,
  });
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const hitCache: Ref<HitCache> = ref({} as HitCache);

  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
    searchResults,
    hitCache,
  };
});
