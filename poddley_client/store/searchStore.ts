import { defineStore } from "pinia";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchString: Ref<string> = ref("");
  const updateSearchString = (searchText: string) => (searchString.value = searchText);

  //Returning
  return {
    searchString,
    updateSearchString,
  };
});
