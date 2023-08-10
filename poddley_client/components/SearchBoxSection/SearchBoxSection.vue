<template>
  <div class="relative mb-1 mt-1 flex flex-grow items-stretch bg-transparent ring-0 focus-within:z-10">
    <input
      type="text"
      name="search"
      id="search"
      placeholder="Search for a quote in a podcast here"
      class="outline-none block h-full w-full justify-center rounded-md border-gray-300 pl-0 pr-8 text-center text-base focus:border-gray-500 focus:ring-gray-500 bg-white text-gray-800"
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
