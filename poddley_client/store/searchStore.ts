import { defineStore } from "pinia";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchString: Ref<string> = ref("");
  const loading: Ref<boolean> = ref(false);

  const updateSearchString = (searchText: string) => (searchString.value = searchText);
  const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);

  //Returning
  return {
    searchString,
    updateSearchString,
    loading,
    setLoadingState,
  };
});
