<template>
  <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" />
</template>
<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";

//Vars
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const { searchString } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const initialSearchQuery: string = "The following is a conversation with attia";
let worker;

//Running
onMounted(() => {
  if (process.client) {
    // Creating a worker
    worker = new Worker(new URL("../public/transcriptionServiceWorker.js?type=module&worker_file", import.meta.url), { type: "module" });

    // Listening for messages from worker
    worker.onmessage = (event: any) => {
      const { action, payload } = event.data;

      switch (action) {
        case "searchCompleted":
          console.log("Received payload: ", payload);
          searchResults.value = payload;
          searchStore.setLoadingState(false);
          break;
        case "searchFailed":
          console.error("Search failed: ", payload);
          searchStore.setLoadingState(false);
          break;
      }
    };
  }
});

async function makeSyncSearch() {
  searchResults.value = await transcriptionService.search(initialSearchQuery);
}

// If the request gets this far, we set the loading to true and we send a request to the webworker
function makeSearch(string: string) {
  searchStore.setLoadingState(true);
  // Send a message to the worker to perform the search
  if (worker) {
    console.log("From worker");
    worker.postMessage({ action: "search", payload: string });
  } else {
    console.log("Not from worker");
    searchStore.setLoadingState(true);
    makeSyncSearch();
    searchStore.setLoadingState(false);
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 0, {
  leading: true,
  trailing: true,
});

// Listening to searchString change and calling debouncedSearch
watch(searchString, debouncedSearch);

// This is the initial instant query to provide good UI
debouncedSearch(initialSearchQuery);
</script>
