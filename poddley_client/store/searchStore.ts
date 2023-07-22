import { defineStore } from "pinia";
import { SearchQuery } from "../types/SearchQuery";
import { SearchResponse } from "types/SearchResponse";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchQuery: Ref<SearchQuery> = ref({
    searchString: "",
  });
  const loading: Ref<boolean> = ref(false);
  const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
  const envy: any = ref("");
  envy.value = globalThis;

  console.log(envy.value);

  //Returning
  return {
    searchQuery,
    loading,
    setLoadingState,
    searchResults,
    envy
  };
});
