<template>
  <a
    class="flex items-center justify-center h-10 p-0 text-gray-400 rounded-md w-28 hover:text-gray-500 focus:ring-gray-500 hover:fill-gray-700 focus:outline-none focus:ring-2 focus:ring-inset sm:w-24"
    href="/"
  >
    <div :class="`flex items-center justify-center ${!loading || 'hidden'}`">
      <svg-icon name="logo" class="block w-4/6 mt-1 min-h-6 max-h-7 fill-gray-600 brightness-90 dark:fill-blue-100" aria-hidden="true" />
    </div>
    <IconsSpinnerIcon v-show="loading === true" />
  </a>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
const searchStore = useSearchStore();
const { loading, searchQuery } = storeToRefs(searchStore);

const toHomeClick = () => {
  console.log("Clicked!");
  searchQuery.value = {
    ...searchQuery.value,
    searchString: undefined,
  };
  console.log("SearchQuery", searchQuery.value);
};
</script>

<style scoped>
:deep(.logo) {
  @apply fill-red-500;
}
</style>
