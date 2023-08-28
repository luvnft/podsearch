<template>
  <ul class="row flex justify-center gap-y-1 gap-x-0 w-full p-0 mb-20 mx-0 mt-0" v-if="searchEntries.length > 0">
    <li class="col-12 p-0 w-full" v-for="(searchEntry, index) in props.searchEntries">
      <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" />
    </li>
  </ul>
  <p v-else class="text-gray-800 text-center mt-4">No results for the given search query.</p>
</template>

<script lang="ts" setup>
import { Hit } from "@/types/SearchResponse";
const props = defineProps<{
  searchEntries: Hit[];
}>();
</script>
