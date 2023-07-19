import { defineStore } from "pinia";
import { SearchQuery, createDefaultSearchQuery } from "../types/SearchQuery";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchQuery: Ref<SearchQuery> = ref(createDefaultSearchQuery());
  const loading: Ref<boolean> = ref(false);

  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);

  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
  };
});
