<template>
  <SearchResults :searchEntries="searchResults.hits" v-if="searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { debounce } from "../utils/tools/tools";

//Vars
const searchStore = useSearchStore();
const searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
const transcriptionService: TranscriptionService = new TranscriptionService();
const { searchString } = storeToRefs(searchStore);

//Initialization function
async function makeSearch(string: string) {
  console.log("Triggered");
  searchResults.value = await transcriptionService.search(string);
}

const debouncedSearch = debounce(makeSearch, 200);

//Running
watch(searchString, debouncedSearch);

//Initial calls
debouncedSearch("following is a conversation with ");
</script>
