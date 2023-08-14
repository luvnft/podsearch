<template>
  <!-- For Phones-->
  <div>
    <SearchResults :searchEntries="searchResults?.hits" v-if="searchResults?.hits" class="sm:hidden" />
  </div>
  <!-- For Desktop-->
  <div class="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:max-w-7xl lg:px-8">
    <div class="max-w-xl">
      <h1 id="order-history-heading" class="text-gray-900 text-3xl font-bold tracking-tight">Order history</h1>
      <p class="text-gray-500 mt-2 text-sm">Check the status of recent orders, manage returns, and discover similar products.</p>
    </div>

    <div class="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
      <div v-for="order in orders" :key="order.id" class="group relative">
        <div class="aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden rounded-md group-hover:opacity-75">
          <img :src="order.imageSrc" :alt="order.imageAlt" class="object-cover object-center" />
        </div>
        <h3 class="text-gray-500 mt-4 text-sm">
          <a :href="order.href">
            <span class="absolute inset-0" />
            {{ order.productName }}
          </a>
        </h3>
        <p class="mt-1 text-lg font-medium">
          <span v-if="order.status === 'delivered'" class="text-gray-900">
            Delivered on
            <time :datetime="order.datetime">{{ order.date }}</time>
          </span>
          <span v-else-if="order.status === 'out-for-delivery'" class="text-indigo-600">Out for delivery</span>
          <span v-else-if="order.status === 'cancelled'" class="text-gray-500">Cancelled</span>
        </p>
      </div>
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

const debounceSetLoadingToggle = _Debounce(searchStore.setLoadingState, 300);

// Make initial search (this probably runs as useServerPrefetch)
onServerPrefetch(async () => {
  await makeSearch();
});

watch(searchQuery, debouncedSearch, {
  deep: true,
});
</script>
