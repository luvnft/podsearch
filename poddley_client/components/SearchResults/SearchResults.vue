<template>
  <ul class="row lg:gris-cols-3 mx-0 mb-20 mt-0 grid w-full grid-cols-1 justify-start gap-y-3 p-0 md:grid-cols-2 xl:grid-cols-4 gap-x-3" v-if="searchEntries.length > 0">
    <li class="m-0 p-0" v-for="(searchEntry, index) in props.searchEntries">
      <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" />
    </li>
  </ul>
  <!-- <p v-else class="text-gray-800 mt-4 text-center">No results for the given search query.</p> -->
</template>

<script lang="ts" setup>
import { Hit } from "../../types/SearchResponse";
const props = defineProps<{
  searchEntries: Hit[];
}>();
</script>

col-12 col-md-6 col-lg-4 col-xl-3
