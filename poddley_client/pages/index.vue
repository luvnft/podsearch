<template>
  <SearchResults :searchEntries="searchResults.hits" v-if="searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { debounce } from "../utils/tools/tools";
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
}

const debouncedSearch = debounce(makeSearch, 0);

//Running
watch(searchString, debouncedSearch);

//Initial calls
makeSearch("following is a conversation with ");
</script>
