<template>
  <div class="tw-relative tw-mb-1 tw-mt-1 tw-flex tw-flex-grow tw-items-stretch tw-bg-transparent tw-ring-0 focus-within:tw-z-10">
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
import { watchEffect } from "vue";
import { RouteLocationNormalizedLoaded, Router } from ".nuxt/vue-router";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";
import { Hit } from "~~/types/SearchResponse";

const utils: Utils = useUtils();
const router: Router = useRouter();
const route: RouteLocationNormalizedLoaded = useRoute();
const searchStore = useSearchStore();
const { searchQuery, loading } = storeToRefs(searchStore);

onMounted(() => {
  searchQuery.value = utils.decodeQuery(route.query?.searchQuery);
  console.log("TROLLOLO: ", searchQuery.value);

  watch(searchQuery, () => {
    if (searchQuery) {
      console.log("OK");
      navigateWithQuery();
    }
  });
});

const navigateWithQuery = () => {
  router.push({
    path: "/",
    query: { searchQuery: utils.encodeQuery(searchQuery.value) },
  });
};
</script>
