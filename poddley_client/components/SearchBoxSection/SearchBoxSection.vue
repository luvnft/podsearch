<template>
  <div class="group bg-gray-100 border-gray-300 relative mb-1 mt-0 flex w-full flex-grow items-center rounded-md border sm:hidden" v-if="props.openSearchSection">
    <SearchBoxSectionCategoryDropDown />
    <input type="text" name="search" id="search" placeholder="Search poddley" :class="`text-gray-900 bg-gray-100 block h-12 w-full rounded-none ${searchQuery.searchString ? '' : 'rounded-r-[0.34rem]'} p-0 text-center text-base focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset`" autofocus @input="handleSearch" :value="searchQuery.searchString" />

    <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString" class="rounded-l-none border-l rounded-r-[0.31rem]">
      <XMarkIcon class="block h-full w-full scale-[0.6] fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
    </ButtonsGenericButton>
  </div>
  <!-- Desktop Search Bar-->
  <div class="h-15 mx-auto hidden w-full flex-col items-center justify-center gap-y-2 pt-2.5 sm:flex sm:pb-0.5 md:px-0">
    <label for="voice-search" class="sr-only">Search</label>
    <div class="relative w-full">
      <SearchBoxSectionCategoryDropDown class="absolute h-12" />

      <input autofocus @input="handleSearch" type="text" id="voice-search" class="text-gray-900 bg-gray-100 block w-full rounded-md p-2.5 pl-10 text-center text-base" placeholder="Search for podcasts, episodes and quotes from podcasts" required />

      <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString">
        <XMarkIcon class="text-gray-500 h-4 w-4" />
      </ButtonsGenericButton>
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
  searchQuery.value = {
    searchString: "",
  };
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
  console.log("occurrence");
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
