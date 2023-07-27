<template>
  <div>
    <div class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-overflow-hidden sm:tw-hidden">
      <button
        v-if="!loading"
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-p-0 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
        @click="toHomeClick"
      >
        <svg-icon name="logo" class="tw-min-h-6 tw-mt-1.5 tw-h-8 tw-max-h-7 tw-w-4/6" />
      </button>
      <IconsSpinnerIcon v-if="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
const searchStore = useSearchStore();
const { loading, searchQuery } = storeToRefs(searchStore);

const toHomeClick = () => {
  searchQuery.value.searchString = "";
};
</script>
