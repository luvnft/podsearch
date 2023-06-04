<template>
  <NavigationBar :loading="loading" />
  <SearchResults :searchEntries="searchStore.searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { useSearchStore } from "@/store/searchStore";

//Router
const route = useRoute();
const router = useRouter();
let loading: Ref<boolean> = ref(false);

//Grabbing initial data for page load
const searchStore = useSearchStore();

//Update url
const updateUrl = () => {
  router.push({ query: { ...route.query, search: searchStore.searchString } });
};

//Initialization function
async function initialLoad() {
  loading.value = true;
  const searchUrl: string | null = route.query.search ? (route.query.search as string) : null;
  await searchStore.search(searchUrl);
  updateUrl();
  loading.value = false;
}

//Running
initialLoad();
</script>
