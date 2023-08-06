<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
          v-if="!loading"
          class="flex h-full w-full items-center justify-center rounded-md p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 "
          @click="toHomeClick"
      >
        <svg-icon name="logo" class="min-h-6 mt-1.5 h-8 max-h-7 w-4/6 " />
      </button>
      <IconsSpinnerIcon v-if="loading" />
    </div>
  </div>
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
