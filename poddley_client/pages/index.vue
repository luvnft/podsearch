<template>
  <div>
    <!-- Desktop Search Bar-->
    <div class="mx-auto hidden flex-col gap-y-2 py-3 md:px-3 sm:flex sm:pb-5">
      <form class="flex items-center">
        <label for="voice-search" class="sr-only">Search</label>
        <div class="relative w-full">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon class="text-gray-500 h-4 w-4" />
          </div>
          <input
            type="text"
            id="voice-search"
            class="text-gray-900 bg-gray-100 border-gray-200 block w-full rounded-lg border p-2.5 pl-10 text-base focus:border-gray-500 focus:ring-gray-500"
            placeholder="Search for podcasts, episodes and quotes from podcasts"
            required
          />
          <button type="button" class="group absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
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
          class="text-neutral-500 bg-gray-100 border-gray-200 ml-2 inline-flex items-center rounded-lg border px-3 py-2.5 text-base font-medium hover:text-neutral-600 hover:bg-gray-100 focus:ring-gray-300 focus:outline-none focus:ring-4"
        >
          <svg class="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
          Search
        </button>
      </form>
    </div>
    <!-- SearchResults -->
    <div class="block">
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
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
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
