<template>
  <div class="tw-flex tw-h-20 tw-w-full tw-gap-2 tw-pb-4 tw-text-lg tw-font-semibold tw-text-gray-500">
    <ButtonsNewButton class="tw-border tw-w-1/2 tw-border-solid tw-border-gray-400">
      <span class="group-active:tw-text-gray-600">New episodes</span>
    </ButtonsNewButton>
    <ButtonsTrendingButton class="tw-w-1/2 tw-border tw-border-solid tw-border-gray-400" @click="searchStore.getTrendingQuotes">
      <span class="group-active:tw-text-gray-600">Trending quotes</span>
    </ButtonsTrendingButton>
  </div>
</template>

<script setup lang="ts">
//Imports
import { useSearchStore } from "@/store/searchStore";

//Grabbing initial data for page load
const searchStore = useSearchStore();
</script>
