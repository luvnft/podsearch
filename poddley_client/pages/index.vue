<template>
  <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" />
</template>
<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";
import { RouteLocationNormalizedLoaded, Router } from ".nuxt/vue-router";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";
import { watchDeep } from "@vueuse/core";

//Vars
let worker: Worker;
const route: RouteLocationNormalizedLoaded = useRoute();
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = useState();
const { searchQuery } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const utils: Utils = useUtils();
const initialSearchQuery: SearchQuery = {
  searchString: "The following is a conversation",
};
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
          searchResults.value = payload;
          debounceSetLoadingToggle(false);
          break;
        case "searchFailed":
          debounceSetLoadingToggle(false);
          break;
      }
    };
  }
});

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch() {
  // Send a message to the worker to perform the search
  if (worker) {
    searchStore.setLoadingState(true);
    console.log("Call to worker");
    worker.postMessage({ action: "search", payload: JSON.stringify(searchQuery.value) });
  } else {
    //First run on server
    if (process.server) {
      console.log("Not call to worker");

      searchStore.setLoadingState(true);
      try {
        const routeBasedQuery = utils.decodeQuery(route.query?.searchQuery);
        const query: SearchQuery = routeBasedQuery ? routeBasedQuery : initialSearchQuery;
        searchResults.value = await transcriptionService.search(query);
        searchStore.setLoadingState(false);
      } catch (e) {}
    }
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 200, {
  leading: true,
  trailing: true,
});

const debounceSetLoadingToggle = _Debounce(searchStore.setLoadingState, 300);

// Make initial search (this probably runs as useServerPrefetch)
onServerPrefetch(async () => {
  console.log("Server prefetch!");
  await makeSearch();
});

onMounted(() => {
  watchDeep(searchQuery, debouncedSearch);
});
</script>
