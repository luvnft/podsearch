<template>
  <div class="tw-flex tw-flex-col tw-justify-center">
    <p v-if="searchStore.loadingSearchResults" class="tw-pb-2">Loading...</p>
    <SearchResults :searchEntries="searchStore.searchResults" />
  </div>
</template>

<script lang="ts" setup>
//Imports
import { useSearchStore } from "@/store/searchStore";

//Grabbing initial data for page load
const searchStore = useSearchStore();

//Initialization function
async function initialLoad() {
  await searchStore.search();
}

//Running
initialLoad();
</script>
