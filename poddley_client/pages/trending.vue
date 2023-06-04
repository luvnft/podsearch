<template>
  <NavigationBar :loading="loading" />
  <SearchResults :searchEntries="searchStore.searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { useSearchStore } from "@/store/searchStore";

//Grabbing initial data for page load
const searchStore = useSearchStore();
let loading: Ref<boolean> = ref(false);

//Initialization function
async function initialLoad() {
  loading.value = true;
  await searchStore.getTrendingQuotes();
  loading.value = false;
}

//Running
initialLoad();
</script>
