<template>
  <NavigationBar :loading="loading" />
  <SearchResults :searchEntries="searchResults.hits" />
</template>

<script lang="ts" setup>
//Imports
import { SearchQuery } from "types/SearchQuery";
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";

let loading: Ref<boolean> = ref(false);
let searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const transcriptionService: TranscriptionService = new TranscriptionService();

//Initialization function
async function initialLoad() {
  loading.value = true;
  const searchQuery: SearchQuery = {
    searchString: "ook some decades a",
  };
  console.log(searchQuery)
  const data = await transcriptionService.search(searchQuery);
  console.log(data);
  loading.value = false;
}

//Running
initialLoad();
</script>
