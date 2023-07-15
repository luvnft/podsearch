<template>
  <SearchResults :searchEntries="searchResults.hits" v-if="searchResults" :key="searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import axios from "axios";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";

//Vars
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const { searchString } = storeToRefs(searchStore);

//Creating Axios instance and Cancel Token
const CancelToken = axios.CancelToken;
let cancel;

//Initialization function
async function makeSearch(string: string) {
  if (cancel !== undefined) {
    cancel();
  }

  console.log("Triggered");
  searchStore.setLoadingState(true);

  try {
    const response = await axios.get("/transcriptions/search/", {
      baseURL: "https://api.poddley.com",
      cancelToken: new CancelToken(function executor(c: any) {
        cancel = c;
      }),
      params: {
        searchString: string,
      },
    });

    searchResults.value = response.data;
    searchStore.setLoadingState(false);
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log("Request canceled", error.message);
    } else {
      // handle error
    }
  }
}

const throttledSearch = _Throttle(makeSearch, 300); // throttling the search to once every 300ms

//Running
watch(searchString, throttledSearch);

//Initial calls
throttledSearch("The following is a conversation with attia");
</script>
