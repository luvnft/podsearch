<template>
  <NavigationBar :loading="loading" />
  <SearchResults :searchEntries="searchResults.hits" v-if="searchResults" />
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";


//Router
const route = useRoute();

let loading: Ref<boolean> = ref(false);
let searchResults: Ref<SearchResponse | null> = ref({} as SearchResponse);
const transcriptionService: TranscriptionService = new TranscriptionService();

//Initialization function
async function initialLoad() {
  loading.value = true;
  const segmentId: string | null = route.query.id ? (route.query.id as string) : null;
  searchResults.value = await transcriptionService.getSegment(segmentId);
  loading.value = false;
}

//Running
initialLoad();
</script>