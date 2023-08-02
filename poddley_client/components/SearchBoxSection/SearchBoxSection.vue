<template>
  <div class="tw-relative tw-mb-1 tw-mt-1 tw-flex tw-flex-grow tw-items-stretch tw-bg-transparent tw-ring-0 focus-within:tw-z-10">
    <input
      type="text"
      name="search"
      id="search"
      placeholder="Search for a quote in a podcast here"
      class="tw-outline-none tw-block tw-h-full tw-w-full tw-justify-center tw-rounded-md tw-border-gray-300 tw-pl-0 tw-pr-8 tw-text-center tw-text-base focus:tw-border-gray-500 focus:tw-ring-gray-500 dark:tw-text-gray-400 dark:hover:tw-bg-gray-600 dark:hover:tw-text-white dark:tw-bg-gray-700"
      autofocus
      v-model="searchQuery.searchString"
      @input="navigateWithQuery"
    />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { Router } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";

const utils: Utils = useUtils();
const router: Router = useRouter();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

//When mounted start the watcher to navigate if not on page etc.
// This is the function that listens to the searchQuery and causes essentially the url to change each time it changes. We call it push, but it's more like some kind of url-change
watch(searchQuery, () => {
  if (searchQuery) {
    navigateWithQuery();
  }
});

//Navigate function
const navigateWithQuery = () => {
  router.push({
    path: "/",
    query: { searchQuery: utils.encodeQuery(searchQuery.value) },
  });
};
</script>
