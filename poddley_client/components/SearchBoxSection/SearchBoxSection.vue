<template>
  <div class="tw-flex tw-w-96 tw-rounded-md tw-border tw-border-gray-200 tw-shadow">
    <div class="tw-relative tw-flex tw-flex-grow tw-items-stretch tw-border-none tw-bg-transparent focus-within:tw-z-10">
      <div class="tw-pointer-events-none tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3">
        <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" aria-hidden="true" />
      </div>
      <input
        v-on:input="debouncedTriggerSearch()"
        v-model="searchStore.searchString"
        type="text"
        name="search"
        id="search"
        class="tw-block tw-w-full tw-rounded-none tw-rounded-l-md tw-border-gray-300 tw-pl-11 tw-text-left tw-text-base focus:tw-border-indigo-500 focus:tw-ring-indigo-500"
      />
    </div>
    <button
      @click="triggerSearch()"
      type="button"
      class="10 tw-group tw-flex tw-w-12 tw-items-center tw-justify-center tw-rounded-r-md tw-border-l tw-border-gray-300 tw-bg-gray-50 tw-p-2 tw-text-gray-700 tw-shadow-sm hover:tw-bg-gray-100 active:tw-shadow-none"
    >
      <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="!searchStore.loadingSearchResults" />
      <LoadingIcon v-if="searchStore.loadingSearchResults" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from "~~/utils/tools/tools";
import { useSearchStore } from "@/store/searchStore";

const searchStore = useSearchStore();
const route = useRoute();
const router = useRouter();

function triggerSearch() {
  updateUrl();
  searchStore.search(searchStore.searchString);
}

const updateUrl = () => {
  router.push({ query: { ...route.query, search: searchStore.searchString } });
};

const debouncedTriggerSearch = debounce(triggerSearch, 200);
</script>
