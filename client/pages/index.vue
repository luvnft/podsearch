<template>
    <div class="block" ref="searchResultsRef">
        <SearchResults :searchEntries="searchResults.hits" v-if="searchResults?.hits && searchResults.hits.length > 0" />
    </div>
</template>
<script lang="ts" setup>
//Imports
import TranscriptionService from "../utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../store/searchStore";
import { SearchQuery } from "types/SearchQuery";
import { ClientSearchResponseHit, ClientSegmentHit } from "../types/ClientSearchResponse";
import { LocationQuery, Router } from "vue-router";
import { Device } from "@nuxtjs/device/dist/runtime/types";

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
const router: Router = useRouter();

//Running
onMounted(async () => {
    if (process.client) {
        // Creating a worker
        //@ts-ignore
        worker = new Worker(new URL("../public/transcriptionServiceWorker.js?type=module&worker_file", import.meta.url), { type: "module" });

        // Listening for messages from worker
        worker.onmessage = (event: any) => {
            const { action, payload } = event.data;
            switch (action) {
                case "searchCompleted":
                    searchStore.setSearchResults(payload);
                    searchStore.setLoadingState(false);
                    break;
                case "searchFailed":
                    searchStore.setLoadingState(false);
                    break;
            }
        };
    }


    // If we are arriving from some subpage the searchResults wont be populated
    if (!searchResults?.value?.hits) {
        searchResults.value = await transcriptionService.search(searchQuery.value);
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
                const decodedRouteBasedQuery: SearchQuery = utils.decodeQuery(routeBasedQuery);
                const query: SearchQuery = decodedRouteBasedQuery ? (decodedRouteBasedQuery) : initialSearchQuery;
                searchResults.value = await transcriptionService.search(query);
            } catch (e) { }
        }
    }
}

// Debounced search calls makeSearch if it follows the limits of the debounce function
const debouncedSearch = _Debounce(makeSearch, 400, {
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

const requestOngoing: Ref<boolean> = ref(false);

const debouncedOffsetIncrement = _Throttle(
    () => {
        if (requestOngoing.value === true) return;
        requestOngoing.value = true;

        searchQuery.value = {
            ...searchQuery.value,
            offset: searchQuery.value.offset !== undefined ? searchQuery.value.offset + 12 : 0,
        };
        setTimeout(() => {
            requestOngoing.value = false;
        }, 2000);
    },
    500,
    {
        leading: true,
        trailing: true
    },
);

// load more data when scrolled 95% of the document.
watch(y, () => {
    scrollY.value = y.value;
    const windowHeight = document.documentElement.scrollHeight;
    const visibleHeight = window.innerHeight;
    if (scrollY.value + visibleHeight >= 0.80 * windowHeight) {
        // If the 
        const routePath: LocationQuery = router?.currentRoute?.value?.query;
        let presence: boolean | undefined = undefined;

        try {
            const routeBasedSearchQuery: SearchQuery = JSON.parse(routePath["searchQuery"] as unknown as string) as SearchQuery;
            presence = routeBasedSearchQuery.filter?.includes("id") ? routeBasedSearchQuery.filter.includes("id") : false;
        }
        catch (e) {
            presence = undefined;
        }
        if (presence === undefined) {
            debouncedOffsetIncrement();
        }
    }
});
</script>
