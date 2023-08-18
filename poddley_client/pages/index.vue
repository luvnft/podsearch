<template>
  <div>
    <!-- For Phones-->
    <div class="block sm:hidden">
      <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" class="sm:hidden" />
    </div>
    <!-- For Desktop-->
    <div class="flex flex-col p-3 mx-auto gap-y-2 sm:px-14 sm:pb-5">
      <form class="flex items-center">
        <label for="voice-search" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.15 5.6h.01m3.337 1.913h.01m-6.979 0h.01M5.541 11h.01M15 15h2.706a1.957 1.957 0 0 0 1.883-1.325A9 9 0 1 0 2.043 11.89 9.1 9.1 0 0 0 7.2 19.1a8.62 8.62 0 0 0 3.769.9A2.013 2.013 0 0 0 13 18v-.857A2.034 2.034 0 0 1 15 15Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="voice-search"
            class="text-gray-900 bg-gray-50 border-gray-300 block w-full rounded-lg border p-2.5 pl-10 text-base focus:border-blue-500 focus:ring-blue-500 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Search Mockups, Logos, Design Templates..."
            required
          />
          <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="w-4 h-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7v3a5.006 5.006 0 0 1-5 5H6a5.006 5.006 0 0 1-5-5V7m7 9v3m-3 0h6M7 1h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z"
              />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          class="text-white bg-blue-700 border-blue-700 ml-2 inline-flex items-center rounded-lg border px-3 py-2.5 text-base font-medium hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 focus:outline-none focus:ring-4"
        >
          <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
          Search
        </button>
      </form>

      <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" />
    </div>
  </div>
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
          console.log(payload);
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
  // Send a message to the worker to perform the search
  if (worker) {
    searchViaWorker();
  } else {
    //First run on server
    if (process.server) {
      try {
        const routeBasedQuery: string | null = requestUrl.searchParams.get("searchQuery");
        const decodedRouteBasedQuery: string | null = utils.decodeQuery(routeBasedQuery);
        console.log(decodedRouteBasedQuery);
        const query: SearchQuery = decodedRouteBasedQuery ? (decodedRouteBasedQuery as SearchQuery) : initialSearchQuery;
        console.log("Searching with query: ", query);
        searchQuery.value = query;
        searchResults.value = await transcriptionService.search(query);
      } catch (e) {}
    }
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 300, {
  leading: true,
  trailing: true,
});

const debounceSetLoadingToggle = _Debounce(searchStore.setLoadingState, 300, {
  leading: true,
  trailing: true,
});

// Make initial search (this probably runs as useServerPrefetch)
onServerPrefetch(async () => {
  await makeSearch();
});

watch(searchQuery, debouncedSearch, {
  deep: true,
});
</script>
