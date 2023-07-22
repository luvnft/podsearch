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
import { NuxtApp, NuxtPayload } from "nuxt/app";

//Vars
let worker: Worker;
const route: RouteLocationNormalizedLoaded = useRoute();
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = useState();
const { searchQuery } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const utils: Utils = useUtils();

async function init() {
  const d: SearchQuery = utils.decodeQuery(route.query.searchQuery) || { searchString: "" };
  console.log("D:", d);
  searchResults.value = await transcriptionService.search(d);
}

async function makeSearch() {
  searchResults.value = await transcriptionService.search(searchQuery.value);
}


watchDeep(searchQuery, makeSearch);

init();
</script>
