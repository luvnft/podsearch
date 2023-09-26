<template>
  <ul class="row lg:gris-cols-3 mx-0 mb-20 mt-0 grid w-full grid-cols-1 justify-start gap-y-3 p-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3" v-if="searchEntries.length > 0">
    <li class="m-0 p-0" v-for="(searchEntry, index) in props.searchEntries">
      <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { Hit } from "../../types/SearchResponse";
const props = defineProps<{
  searchEntries: Hit[];
}>();
</script>