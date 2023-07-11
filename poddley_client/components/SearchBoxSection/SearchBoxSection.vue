<template>
  <div class="-tw-mt-0 tw-mb-0 tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border-none">
    <div class="tw-relative tw-flex tw-flex-grow tw-items-stretch tw-border-none tw-bg-transparent focus-within:tw-z-10">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search for a quote in a podcast here"
        class="tw-block tw-w-full tw-justify-center tw-rounded-none tw-rounded-l-md tw-border-gray-300 tw-pl-3.5 tw-text-center tw-text-base focus:tw-border-indigo-500 focus:tw-ring-indigo-500"
        autofocus
        v-model="searchString"
      />
      <IconsSpinnerIcon v-show="loading" class="tw-absolute tw-right-3 tw-top-1/2 tw-mt-0 tw--translate-y-1/2 tw-scale-90 tw-transform" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
const searchStore = useSearchStore();
const { searchString, loading } = storeToRefs(searchStore);
</script>
