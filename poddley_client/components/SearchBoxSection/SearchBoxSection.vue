<template>
  <div class="tw-relative tw-mb-1 tw-mt-1 tw-flex tw-flex-grow tw-items-stretch tw-bg-transparent tw-ring-0 focus-within:tw-z-10" v-if="searchQuery">
    <input
      type="text"
      name="search"
      id="search"
      placeholder="Search for a quote in a podcast here"
      class="tw-block tw-h-full tw-w-full tw-justify-center tw-rounded-md tw-border-gray-300 tw-pl-0 tw-pr-8 tw-text-center tw-text-base focus:tw-border-gray-500 focus:tw-ring-gray-500"
      autofocus
      v-model="searchQuery.searchString"
      @input="navigateWithQuery"
    />
    <!-- <IconsSpinnerIcon v-show="loading" class="tw-absolute tw-right-3 tw-top-1/2 tw-mt-0 tw--translate-y-1/2 tw-scale-90 tw-transform" /> -->
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { RouteLocationNormalizedLoaded, Router } from ".nuxt/vue-router";
import { Utils } from "composables/useUtils";
import { createDefaultSearchQuery } from "../../types/SearchQuery";

const utils: Utils = useUtils();
const router: Router = useRouter();
const route: RouteLocationNormalizedLoaded = useRoute();
const searchStore = useSearchStore();
const { searchQuery, loading } = storeToRefs(searchStore);

//When mounted start the watcher to navigate if not on page etc.
onMounted(() => {
  watch(searchQuery, () => {
    if (searchQuery) {
      navigateWithQuery();
    }
  });
});

// When initial load, grab the route query and decode into ref
console.log(utils.decodeQuery(route.query?.searchQuery));
console.log(utils.decodeQuery(route.query?.searchQuery) || createDefaultSearchQuery());
searchQuery.value = utils.decodeQuery(route.query?.searchQuery) || createDefaultSearchQuery();

//Navigate function
const navigateWithQuery = () => {
  router.push({
    path: "/",
    query: { searchQuery: utils.encodeQuery(searchQuery.value) },
  });
};
</script>
