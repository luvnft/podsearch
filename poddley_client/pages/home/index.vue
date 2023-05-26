<template>
  <div class="tw-flex tw-flex-col tw-justify-center tw-min-h-screen tw-min-w-full tw-items-center">
    <NavigationBar />
    <SearchResults :searchEntries="searchStore.searchResults" />
  </div>
</template>

<script lang="ts" setup>
//Imports
import { useSearchStore } from "@/store/searchStore";

//Router
const route = useRoute();

//Grabbing initial data for page load
const searchStore = useSearchStore();

//Initialization function
async function initialLoad() {
  const searchUrl: string | null = route.query.search ? (route.query.search as string) : null;
  await searchStore.search(searchUrl);
}

//Running
initialLoad();
</script>
