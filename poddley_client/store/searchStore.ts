import { defineStore } from "pinia";

import { Hit } from "~~/types/SearchResponse";
import TranscriptionsService from "~~/utils/services/TranscriptionsService";
import { SearchResponse } from "~~/types/SearchResponse";

export const useSearchStore = defineStore("searchStore", () => {
  //Searchvariable
  const searchResults = ref<Hit[]>([]);
  const transcriptionsService: TranscriptionsService = new TranscriptionsService();
  const loadingSearchResults: Ref<boolean> = ref<boolean>(false);
  const searchString: Ref<string> = ref<string>("");

  //General search functionality
  async function search(searchInput?: string | null) {
    // Toggle loading and set searchString to default value if passed in undefined
    toggleLoading(true);
    if (!searchInput) searchString.value = '';
    else searchString.value = searchInput;
    
    // Search
    const data: SearchResponse = await transcriptionsService.search(searchString.value);
    if (data) searchResults.value = data.hits;

    // Toggle off loading and return data
    toggleLoading(false);
    return data;
  }

  //Loading toggle function
  function toggleLoading(bool: boolean) {
    loadingSearchResults.value = bool;
  }

  //Returning
  return {
    search,
    searchResults,
    toggleLoading,
    loadingSearchResults,
    searchString,
  };
});
