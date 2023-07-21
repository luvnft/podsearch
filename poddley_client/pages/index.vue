<template>
  <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits?.length > 0" />
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

//Running
onMounted(() => {
  // if (process.client) {
  //   // Creating a worker
  //   worker = new Worker(new URL("../public/transcriptionServiceWorker.js?type=module&worker_file", import.meta.url), { type: "module" });
  //   // Listening for messages from worker
  //   worker.onmessage = (event: any) => {
  //     console.log("Message received!");
  //     const { action, payload } = event.data;
  //     switch (action) {
  //       case "searchCompleted":
  //         searchResults.value = payload;
  //         searchStore.setLoadingState(false);
  //         break;
  //       case "searchFailed":
  //         searchStore.setLoadingState(false);
  //         break;
  //     }
  //   };
  // }
});

// If the request gets this far, we set the loading to true and we send a request to the webworker
async function makeSearch() {
  searchStore.setLoadingState(true);

  // Send a message to the worker to perform the search
  if (worker) {
    console.log("OK???");
    worker.postMessage({ action: "search", payload: JSON.stringify(searchQuery.value) });
  } else {
    const routeBasedQuery = utils.decodeQuery(route.query?.searchQuery);

    const query: SearchQuery = routeBasedQuery ? routeBasedQuery : searchQuery.value;
    console.log("Routebased: ", routeBasedQuery);
    console.log("Query: ", query);
    searchResults.value = await transcriptionService.search(searchQuery.value);
    searchStore.setLoadingState(false);
  }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 300, {
  leading: true,
  trailing: true,
});

// Listening to searchString change and calling debouncedSearch
watchDeep(searchQuery, debouncedSearch);

// On page load run makeSearch
onServerPrefetch(async () => {
  const route2: RouteLocationNormalizedLoaded = useRoute();

  const time = new Date().getTime();
  console.log("ServerPrefetch?", time);
  const routeBasedQuery = utils.decodeQuery(route2.query?.searchQuery);
  console.log(JSON.stringify(routeBasedQuery));
  console.log("route", JSON.stringify(route2));
  const query: SearchQuery = routeBasedQuery
    ? routeBasedQuery
    : {
        searchString: "luka",
      };

  console.log("Routebased: ", routeBasedQuery);
  console.log("Query: ", query);
  console.log(window);
  searchQuery.value = query;
  searchResults.value = await transcriptionService.search(query);
});

const time = new Date().getTime();
console.log("Second?", time);

onBeforeMount(async () => {
  await makeSearch();
});
</script>
