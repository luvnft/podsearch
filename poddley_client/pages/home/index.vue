<template>
  <div class="tw-flex tw-flex-col tw-justify-center">
    <p v-if="searchStore.loadingSearchResults" class="tw-pb-2">
    <LoadingIcon />
    </p>
    <SearchResults :searchEntries="searchStore.searchResults" />
  </div>
</template>

<script lang="ts" setup>
//Imports
import { useSearchStore } from "@/store/searchStore";

//Router
const route = useRoute();
const router = useRouter();

//Grabbing initial data for page load
const searchStore = useSearchStore();

//Initialization function
async function initialLoad() {
  const searchUrl: string = route.query.search ? (route.query.search as string) : "JavaScript";
  await searchStore.search(searchUrl);
}

//Running
initialLoad();
</script>
