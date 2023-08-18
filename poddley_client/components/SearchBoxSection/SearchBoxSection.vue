<template>
  <div class="relative mb-1 mt-1 flex flex-grow items-center bg-transparent ring-0 outline-none border-[3px] border-gray-400 rounded-lg">
    <input
      type="text"
      name="search"
      id="search"
      placeholder="Search for a quote in a podcast here"
      class="justify-center block w-full h-full pl-2 pr-1 text-base text-center text-gray-800 bg-white border-gray-300 rounded-md outline-none dark:placeholder:text-gray-200 placeholder:text-neutral-300 focus:border-gray-500 focus:ring-gray-500"
      autofocus
      v-model="searchQuery.searchString"
      @input="navigateWithQuery"
    />

    <button
      v-if="searchQuery.searchString"
      @click="cleanSearchString"
      class="flex items-center justify-center h-full p-2 mr-0 text-gray-400 border-0 rounded-md outline-none aspect-square hover:text-gray-500 hover:bg-gray-transparent ring-0 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
    >
      <XMarkIcon class="block w-full h-full scale-90 fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
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
