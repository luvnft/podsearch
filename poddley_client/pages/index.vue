<template>
  <div class="block" ref="searchResultsRef">
    <SearchResults :searchEntries="searchResults.hits" v-if="searchResults?.hits" />
  </div>
</template>
<script lang="ts" setup>
//Imports
import TranscriptionService from "../utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";

const scrollY = ref(0);
const { y } = useWindowScroll();

//Vars
let worker: Worker;
const requestUrl: URL = useRequestURL();
const searchStore = useSearchStore();
const { searchQuery, searchResults } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const utils: Utils = useUtils();
const initialSearchQuery: SearchQuery = {
  searchString: "The following is a conversation",
  offset: 0,
};
//Running
onMounted(() => {
  if (process.client) {
    // Creating a worker
    worker = new Worker(new URL("../public/transcriptionServiceWorker.js?type=module&worker_file", import.meta.url), { type: "module" });

    // Listening for messages from worker
    worker.onmessage = (event: any) => {
      const { action, payload } = event.data;

      console.log("Action: ", action);
      console.log("Payload: ", payload);
      switch (action) {
        case "searchCompleted":
          // searchResults.value = payload;
          console.log("OK");
          console.log("payload", payload);
          searchStore.setSearchResults(payload);
          searchStore.setLoadingState(false);
          break;
        case "searchFailed":
          searchStore.setLoadingState(false);
          break;
      }
    };
  }
});

function searchViaWorker() {
  console.log("Searching via worker");
  searchStore.setLoadingState(true);
  worker.postMessage({ action: "search", payload: JSON.stringify(searchQuery.value) });
}

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch() {
  console.log("Searching....");
  // Send a message to the worker to perform the search
  if (worker) {
    searchViaWorker();
  } else {
    //First run on server
    if (process.server) {
      try {
        const routeBasedQuery: string | null = requestUrl.searchParams.get("searchQuery");
        const decodedRouteBasedQuery: string | null = utils.decodeQuery(routeBasedQuery);
        const query: SearchQuery = decodedRouteBasedQuery ? (decodedRouteBasedQuery as SearchQuery) : initialSearchQuery;
        searchResults.value = await transcriptionService.search(query);
      } catch (e) {}
    }
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 1000, {
  leading: false,
  trailing: true,
});

// Make initial search (this probably runs as useServerPrefetch)
onServerPrefetch(async () => {
  await makeSearch();
});

watch(searchQuery, debouncedSearch, {
  deep: true,
});

const debouncedOffsetIncrement = _Debounce(
  () => {
    searchQuery.value = {
      ...searchQuery.value,
      offset: searchQuery.value.offset !== undefined ? searchQuery.value.offset + 12 : 0,
    };
  },
  1000,
  {
    leading: false,
    trailing: true,
  }
);

// load more data when scrolled 70% of the document.
watch(y, () => {
  scrollY.value = y.value;
  const windowHeight = document.documentElement.scrollHeight;
  const visibleHeight = window.innerHeight;
  console.log("OK");

  if (scrollY.value + visibleHeight >= 0.5 * windowHeight) {
    console.log("SEESES: ", searchQuery.value);
    debouncedOffsetIncrement();
    
    console.log("new searchQuery: ", searchQuery.value);
  }
});
</script>
