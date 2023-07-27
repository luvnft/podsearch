<template>
  <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" />
</template>
<script lang="ts" setup>
//Imports
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";
import { RouteLocationNormalizedLoaded, Router } from ".nuxt/vue-router";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";

//Vars
let worker: Worker;
const route: RouteLocationNormalizedLoaded = useRoute();
const routePath: Ref<string> = ref(route.fullPath);
const requestUrl: URL = useRequestURL();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);
const searchResults: Ref<any> = useState();
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

function searchViaWorker() {
  searchStore.setLoadingState(true);
  worker.postMessage({ action: "search", payload: JSON.stringify(searchQuery.value) });
}

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch() {
  console.log("HUH?=?");
  // Send a message to the worker to perform the search
  if (worker) {
    searchViaWorker();
  } else {
    //First run on server
    if (process.server) {
      try {
        const routeBasedQuery: string | null = requestUrl.searchParams.get("searchQuery");
        const parsedRouteBasedQuery: SearchQuery | null = routeBasedQuery ? JSON.parse(routeBasedQuery) : null;
        const query: SearchQuery = parsedRouteBasedQuery ? parsedRouteBasedQuery : initialSearchQuery;
        console.log("Searching with query: ", query.filter);
        searchResults.value = await transcriptionService.search(query);
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
  await makeSearch();
});

watch(searchQuery.value, debouncedSearch);
</script>
