<template>
  <button
    type="button"
    class="d-flex items-center font-medium tw-group tw-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200 tw-bg-gray-50 tw-fill-gray-400 tw-p-2 tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm"
  >
    <IconsTrendingIcon class="tw-h-6 tw-w-6 tw-scale-[0.8] tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" v-if="!searchStore.loadingSearchResults" />
    <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="searchStore.loadingSearchResults" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useSearchStore } from "@/store/searchStore";

const searchStore = useSearchStore();
</script>
