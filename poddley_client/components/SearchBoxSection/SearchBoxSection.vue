<template>
  <div class="group bg-gray-100 border-gray-300 relative mb-0 mt-0 flex w-full flex-grow items-center rounded-lg border sm:hidden" v-if="props.openSearchSection">
    <input type="text" name="search" id="search" placeholder="Search podcast transcriptions" :class="`text-gray-900 bg-gray-100 block h-10 w-full rounded-lg ${searchQuery.searchString ? '' : 'rounded-r-lg'} py-0 pl-0 pr-0 text-center text-base focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset`" autofocus @input="handleSearch" :value="searchQuery.searchString" />

    <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString" class="border-gray-300 rounded-l-none rounded-r-[0.31rem] border-none absolute right-0 z-50 bg-neutral-100 h-8 w-8 mr-1">
      <XMarkIcon class="block h-full w-full scale-[0.6] fill-gray-300 group-hover:fill-gray-500 absolute" aria-hidden="true" />
    </ButtonsGenericButton>
  </div>
  <div class="bg-gray-100 border-gray-200 mx-auto hidden w-full flex-col items-center justify-center gap-y-2 rounded-md border py-0 sm:flex md:px-0">
    <div class="relative w-full h-10 flex-row sm:flex items-center ">
      <input type="text" name="search" id="search" placeholder="Search podcast transcriptions" :class="`text-gray-900 bg-gray-100 block h-10 w-full rounded-lg ${searchQuery.searchString ? '' : 'rounded-r-lg'} py-0 pl-0 pr-0 text-center text-base focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset`" autofocus @input="handleSearch" :value="searchQuery.searchString" />
      <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString" class="border-gray-300 rounded-l-none rounded-r-[0.31rem] border-none absolute right-0 z-50 bg-neutral-100 h-8 w-9 mr-1">
      <XMarkIcon class="block h-full w-full scale-[0.6] fill-gray-300 group-hover:fill-gray-500 absolute" aria-hidden="true" />
    </ButtonsGenericButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { Router } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { SearchQuery } from "../../types/SearchQuery";

const utils: Utils = useUtils();
const router: Router = useRouter();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

const props = defineProps<{
  openSearchSection: boolean;
}>();

// Updating searchQuery:
searchQuery.value = {
  ...searchQuery.value,
};

const cleanSearchString = () => {
  searchQuery.value = {
    searchString: "",
  };
};

const handleSearch = (event: any) => {
  const searchQ: SearchQuery = {
    ...searchQuery.value,
  };
  searchQ.searchString = event?.target?.value || "";
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
