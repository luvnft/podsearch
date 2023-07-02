<template>
  <div class="tw-flex tw-w-96 tw-rounded-md tw-border tw-border-gray-200 tw-shadow">
    <div class="tw-relative tw-flex tw-flex-grow tw-items-stretch tw-border-none tw-bg-transparent focus-within:tw-z-10">
      <div class="tw-pointer-events-none tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3">
        <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search for a quote in a podcast"
        class="tw-block tw-w-full tw-justify-center tw-rounded-none tw-rounded-l-md tw-border-gray-300 tw-pl-11 tw-text-left tw-text-base focus:tw-border-indigo-500 focus:tw-ring-indigo-500"
        v-model="searchString"
        :input="debouncedTriggerSearch"
      />
    </div>
    <button
      type="button"
      title="searchButton"
      class="10 tw-group tw-flex tw-w-12 tw-items-center tw-justify-center tw-rounded-r-md tw-border-l tw-border-solid tw-border-gray-300 tw-bg-gray-50 tw-p-2 tw-text-gray-700 tw-shadow-sm hover:tw-bg-gray-100 active:tw-shadow-none"
    >
      <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="!loading" />
      <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="loading" />
    </button>
  </div>
</template>

<script lang="ts" setup>
//Imports
import { SearchResponse } from "~/types/SearchResponse";
import TranscriptionService from "~/utils/services/TranscriptionsService";
import { debounce } from "~~/utils/tools/tools";

const transcriptionService: TranscriptionService = new TranscriptionService();
const route = useRoute();
const router = useRouter();
const searchString: Ref<string> = ref("luka");
let loading: Ref<boolean> = ref(false);
let searchResults: Ref<SearchResponse> = ref({} as SearchResponse);

//TriggerSearch
async function triggerSearch() {
  loading.value = true;
  // updateUrl();
  debouncedTriggerSearch(searchString);
  loading.value = false;
}
const debouncedTriggerSearch = debounce(triggerSearch, 200);

//Initialization function
async function initialLoad() {
  loading.value = true;
  searchResults.value = await transcriptionService.getTrending();
  loading.value = false;
}

// const updateUrl = () => {
//   router.push({ query: { ...route.query, search: searchStore.searchString } });
// };

//Running
// initialLoad();
</script>
