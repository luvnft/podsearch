<template>
  <SearchResults :searchEntries="searchResults.hits" v-if="searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { debounce } from "lodash";
import { useSearchStore } from "../store/searchStore";

//Vars
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const transcriptionService: TranscriptionService = new TranscriptionService();
const { searchString } = storeToRefs(searchStore);

//Initialization function
async function makeSearch(string: string) {
  console.log("Triggered");
  searchStore.setLoadingState(true);
  searchResults.value = await transcriptionService.search(string);
  searchStore.setLoadingState(false);
  console.log(searchResults.value);
}

const debouncedSearch = debounce(makeSearch, 250, {
  leading: true,
  trailing: true,
  maxWait: 1000,
});

//Running
watch(searchString, debouncedSearch);

//Initial calls
makeSearch("The following is a conversation with attia");
</script>
