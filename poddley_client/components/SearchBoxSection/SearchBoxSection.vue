<template>
  <div class="group bg-gray-100 border-gray-300 relative mb-0 mt-0 flex w-full flex-grow items-center rounded-md border sm:hidden" v-if="props.openSearchSection">
    <SearchBoxSectionCategoryDropDown :chosenCategory="chosenCategory" :handleCategoryChange="handleCategoryChange" />
    <FilterDropDown :chosenCategory="chosenCategory" :handleCategoryChange="handleCategoryChange" />

    <input type="text" name="search" id="search" placeholder="Search poddley" :class="`text-gray-900 bg-gray-100 block h-12 w-full rounded-none ${searchQuery.searchString ? '' : 'rounded-r-[0.34rem]'} py-0 pl-2 pr-0 text-center text-base focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset`" autofocus @input="handleSearch" :value="searchQuery.searchString" />

    <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString" class="border-gray-300 rounded-l-none rounded-r-[0.31rem] border-none">
      <XMarkIcon class="block h-full w-full scale-[0.6] fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
    </ButtonsGenericButton>
  </div>
  <!-- Desktop Search Bar-->
  <div class="bg-gray-100 border-gray-200 mx-auto hidden w-full flex-col items-center justify-center gap-y-2 rounded-md border py-0 sm:flex md:px-0">
    <div class="relative w-full flex-row sm:flex">
      <SearchBoxSectionCategoryDropDown :chosenCategory="chosenCategory" :handleCategoryChange="handleCategoryChange" />
      <FilterDropDown :chosenCategory="chosenCategory" :handleCategoryChange="handleCategoryChange" />

      <input autofocus @input="handleSearch" type="text" id="voice-search" :class="`text-gray-900 bg-gray-100 block w-full ${searchQuery.searchString ? '' : 'rounded-r-md'} p-2.5 text-center text-base focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset`" placeholder="Search for podcasts, episodes and quotes from podcasts" required />

      <ButtonsGenericButton v-if="searchQuery.searchString" @click="cleanSearchString" class="border-gray-300 rounded-l-none rounded-r-[0.31rem] border-none">
        <XMarkIcon class="block h-full w-full scale-[0.6] fill-gray-300 group-hover:fill-gray-500" aria-hidden="true" />
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
import { SearchQuery } from "#build/types/SearchQuery";
import FilterDropDown from "./FilterDropDown.vue";

const utils: Utils = useUtils();
const router: Router = useRouter();
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

const props = defineProps<{
  openSearchSection: boolean;
}>();

const chosenCategory: Ref<{
  key: string;
  name: string;
}> = ref<{
  key: string;
  name: string;
}>({
  key: "quote",
  name: "Quotes",
});
const handleCategoryChange = (event: any) => {
  console.log("Event: ", event)
  switch (event?.target?.name) {
    case "quote":
      chosenCategory.value = {
        key: "quote",
        name: "Quotes",
      };
      break;
    case "episode":
      chosenCategory.value = {
        key: "episode",
        name: "Episode",
      };
      break;
    case "podcast":
      chosenCategory.value = {
        key: "podcast",
        name: "Podcast",
      };
      break;
    default:
      chosenCategory.value = {
        key: "error",
        name: "error",
      };
      break;
  }

  // Updating searchQuery:
  searchQuery.value = {
    ...searchQuery.value,
    
  }
};


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
