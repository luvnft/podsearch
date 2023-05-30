<template>
  <div class="tw-flex tw-h-20 tw-w-full tw-gap-2 tw-pb-4 tw-text-base tw-font-semibold tw-text-gray-500">
    <ButtonsNewButton class="tw-w-1/2 tw-border tw-border-solid tw-border-gray-300">
      <span class="group-active:tw-text-gray-600">New episodes</span>
    </ButtonsNewButton>
    <ButtonsTrendingButton class="tw-w-1/2 tw-border tw-border-solid tw-border-gray-300" @click="searchStore.getTrendingQuotes">
      <IconsTrendingIcon class="tw-h-6 tw-w-6 tw-scale-[0.8] tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" v-if="!searchStore.loadingSearchResults" />
      <span class="group-active:tw-text-gray-600" v-if="!searchStore.loadingSearchResults">Trending quotes</span>

      <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="searchStore.loadingSearchResults" />
    </ButtonsTrendingButton>
  </div>
</template>

<script setup lang="ts">
//Imports
import { useSearchStore } from "@/store/searchStore";

//Grabbing initial data for page load
const searchStore = useSearchStore();
</script>
