import { defineStore } from "pinia";
import { SearchQuery } from "types/SearchQuery";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchQuery: Ref<SearchQuery> = ref({} as SearchQuery);
  const loading: Ref<boolean> = ref(false);

  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);

  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
  };
});
