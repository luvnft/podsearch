<template>
  <div class="relative mb-1 mt-1 flex flex-grow items-center bg-transparent ring-0">
    <input
      type="text"
      name="search"
      id="search"
      placeholder="Search for a quote in a podcast here"
      class="text-gray-800 bg-white border-gray-300 block h-full w-full justify-center rounded-md pl-2 pr-1 text-center text-base outline-none focus:border-gray-500 focus:ring-gray-500"
      autofocus
      v-model="searchQuery.searchString"
      @input="navigateWithQuery"
    />

    <button
      v-if="searchQuery.searchString"
      @click="cleanSearchString"
      class="text-gray-400 mr-1 flex aspect-square h-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
    >
      <XMarkIcon class="block h-full w-full scale-90 fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { Router } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const utils: Utils = useUtils();
const router: Router = useRouter();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

const cleanSearchString = () => {
  searchQuery.value.searchString = "";
};

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
