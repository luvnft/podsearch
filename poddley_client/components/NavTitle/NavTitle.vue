<template>
  <GenericButton
    class="text-gray-400 flex h-12 w-28 items-center justify-center rounded-md fill-gray-600 p-0 hover:text-gray-500 focus:ring-gray-500 hover:fill-gray-700 focus:outline-none focus:ring-2 focus:ring-inset dark:fill-neutral-400 dark:hover:fill-gray-300 sm:w-24"
    @click="toHomeClick"
  >
    <div :class="`flex items-center justify-center ${!loading || 'hidden'}`">
      <svg-icon name="logo" class="min-h-6 mt-1 block max-h-7 w-4/6 fill-gray-500 brightness-90 dark:fill-neutral-200" aria-hidden="true" />
    </div>
    <IconsSpinnerIcon v-show="loading === true" />
  </GenericButton>
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
    searchString: "",
  };
  console.log("SearchQuery", searchQuery.value);
};
</script>

<style scoped>
:deep(.logo) {
  @apply fill-red-500;
}
</style>
