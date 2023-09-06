<template>
  <div class="group bg-gray-100 border-gray-400 relative mb-1 mt-0 flex h-12 w-full flex-grow items-center rounded-lg border-none bg-transparent outline-none outline-gray-500 ring-0 sm:hidden mt-1" v-if="props.openSearchSection">
    <input type="text" name="search" id="search" placeholder="Search for a quote in a podcast here" class="text-gray-900 bg-gray-100 block w-full rounded-lg p-2.5 text-center text-base outline-none focus:border-gray-500 focus:ring-gray-500 focus:border-none focus:ring-0" autofocus @input="handleSearch" />

    <button v-if="searchQuery.searchString" @click="cleanSearchString" class="z-50 bg-gray-100 rounded-lg absolute right-0 hover:bg-gray-transparent text-gray-400 mr-0 flex aspect-square h-full items-center justify-center rounded-md border-none p-2 outline-none ring-0 hover:text-gray-500 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset">
      <XMarkIcon class="block h-full w-full scale-90 fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
    </button>
  </div>
  <!-- Desktop Search Bar-->
  <div class="h-15 mx-auto hidden w-full flex-col items-center justify-center gap-y-2 pt-2.5 sm:flex sm:pb-0.5 md:px-0">
    <label for="voice-search" class="sr-only">Search</label>
    <div class="relative w-full">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon class="text-gray-500 h-4 w-4" />
      </div>
      <input autofocus @input="handleSearch" type="text" id="voice-search" class="text-gray-900 bg-gray-100 border-gray-200 block w-full rounded-lg border p-2.5 pl-10 text-center text-base focus:border-gray-500 focus:ring-gray-500" placeholder="Search for podcasts, episodes and quotes from podcasts" required />

      <button type="button" class="group absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-lg" v-if="searchQuery.searchString" @click="cleanSearchString">
        <XMarkIcon class="text-gray-500 h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { Router } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { SearchQuery } from "#build/types/SearchQuery";

const props = defineProps<{
  openSearchSection: boolean;
}>();

const utils: Utils = useUtils();
const router: Router = useRouter();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

const cleanSearchString = () => {
  searchQuery.value.searchString = "";
};

const handleSearch = (event: any) => {
  const searchQ: SearchQuery = {
    searchString: event?.target?.value || "",
  };
  searchQuery.value = searchQ;
};

//When mounted start the watcher to navigate if not on page etc.
//This is the function that listens to the searchQuery and causes essentially the url to change each time it changes. We call it push, but it's more like some kind of url-change
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
