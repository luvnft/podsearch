import { defineStore } from "pinia";
import { ClientSearchResponse } from "../types/ClientSearchResponse";
import { SearchQuery } from "../types/SearchQuery";
const utils: Utils = useUtils();

export const useSearchStore = defineStore("searchStore", () => {
    const searchQuery: Ref<SearchQuery> = ref({
        searchString: "",
        offset: 0,
    });

    const previousSearchQuery: Ref<string> = ref("");
    const loading: Ref<boolean> = ref(false);
    const searchResults: Ref<ClientSearchResponse> = ref({} as ClientSearchResponse);
    const setLoadingState = (loadingState: boolean) => (loading.value = loadingState);
    const setSearchResults = (searchResponse: ClientSearchResponse) => {
        
        
        if (searchResponse.query === previousSearchQuery.value) {
            
            searchResults.value.hits = utils.removeDuplicates([...searchResults.value.hits, ...searchResponse.hits], "id");
            
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
