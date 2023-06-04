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
        placeholder="Search for a quote in a podcast"
        class="tw-block tw-w-full tw-justify-center tw-rounded-none tw-rounded-l-md tw-border-gray-300 tw-pl-11 tw-text-left tw-text-base focus:tw-border-indigo-500 focus:tw-ring-indigo-500"
      />
    </div>
    <button
      @click="triggerSearch()"
      type="button"
      class="10 tw-group tw-flex tw-w-12 tw-items-center tw-justify-center tw-rounded-r-md tw-border-l tw-border-gray-300 tw-border-solid tw-bg-gray-50 tw-p-2 tw-text-gray-700 tw-shadow-sm hover:tw-bg-gray-100 active:tw-shadow-none"
    >
      <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="!loading" />
      <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="loading" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from "~~/utils/tools/tools";
import { useSearchStore } from "@/store/searchStore";

//Vars
let loading: Ref<boolean> = ref(false);

const searchStore = useSearchStore();
const route = useRoute();
const router = useRouter();

//TriggerSearch
async function triggerSearch() {
  loading.value = true;
  updateUrl();
  await searchStore.search(searchStore.searchString);
  loading.value = false;

}

const updateUrl = () => {
  router.push({ query: { ...route.query, search: searchStore.searchString } });
};

const debouncedTriggerSearch = debounce(triggerSearch, 200);
</script>
