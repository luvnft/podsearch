<template>
  <div class="block" ref="searchResultsRef">
    <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" />
  </div>
</template>
<script lang="ts" setup>
//Imports
import TranscriptionService from "../utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";

const searchResultsRef: Ref<HTMLElement | null> = ref(null);
const scrollY = ref(0);
const { y } = useWindowScroll();

// load more data when scrolled 70% of the document.
watch(y, () => {
  scrollY.value = y.value;
  const windowHeight = document.documentElement.scrollHeight;
  const visibleHeight = window.innerHeight;

  if (scrollY.value + visibleHeight >= 0.7 * windowHeight) {
    console.log("calling");
  }
});

//Vars
let worker: Worker;
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

      console.log("event: ", event);
      switch (action) {
        case "searchCompleted":
          searchResults.value = payload;
          console.log("PP:", payload);
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
  console.log("SearchQuery: ", searchQuery.value);
  worker.postMessage({ action: "search", payload: JSON.stringify(searchQuery.value) });
}

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch() {
  console.log("Searching... ", searchQuery.value);
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
        // searchQuery.value = query;
        searchResults.value = await transcriptionService.search(query);
        console.log("RES: ", searchResults.value);
      } catch (e) {}
    }
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 300, {
  leading: true,
  trailing: true,
});

const debounceSetLoadingToggle = _Debounce(searchStore.setLoadingState, 500, {
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
</script>
