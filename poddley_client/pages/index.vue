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
import { Utils } from "composables/useUtils";

//Vars
const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const { searchString } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const initialSearchQuery: string = "The following is a conversation with attia";
const utils: Utils = useUtils();
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
          searchResults.value = payload;
          searchStore.setLoadingState(false);
          break;
        case "searchFailed":
          searchStore.setLoadingState(false);
          break;
      }
    };
  }
});

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch(string: string) {
  searchStore.setLoadingState(true);

  // Update url query:
  // utils.updateRouteQuery("searchString", string, router, route);

  // Send a message to the worker to perform the search
  if (worker) {
    console.log("Triggered");
    console.log("string is: ", string);
    worker.postMessage({ action: "search", payload: string });
  } else {
    searchResults.value = await transcriptionService.search(initialSearchQuery);
    searchStore.setLoadingState(false);
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 500, {
  leading: true,
  trailing: true,
  maxWait: 500,
});

// Listening to searchString change and calling debouncedSearch
watch(searchString, debouncedSearch);

// This is the initial instant query to provide good UI
const routeSearchString: string = (route.query.searchString as string) || initialSearchQuery;
makeSearch(routeSearchString);
</script>
