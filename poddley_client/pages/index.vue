<template>
    <NavigationBar :loading="loading" />
    <SearchResults :searchEntries="searchResults.hits" />
  </template>
  
  <script lang="ts" setup>
  import { SearchResponse } from '~/types/SearchResponse';
  import TranscriptionService from '~/utils/services/TranscriptionsService';
  
  let loading: Ref<boolean> = ref(false);
  let searchResults: Ref<SearchResponse> = ref({} as SearchResponse);
  const transcriptionService: TranscriptionService = new TranscriptionService();
  
  //Initialization function
  async function initialLoad() {
    loading.value = true;
    // searchResults.value = await transcriptionService.getNew();
    loading.value = false;
  }
  
  //Running
  initialLoad();
  </script>
  