<template>
  <ul class="row m-0 flex justify-center gap-y-5 p-0" v-if="searchEntries.length > 0">
    <li class="col-12 max-w-md p-0 md:p-2" v-for="(searchEntry, index) in props.searchEntries">
      <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" />
    </li>
  </ul>
  <p class="text-gray-800 text-center mt-4">No results for the given search query.</p>
</template>

<script lang="ts" setup>
import { Hit } from "@/types/SearchResponse";
const props = defineProps<{
  searchEntries: Hit[];
}>();
</script>
