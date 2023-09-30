<template>
  <ul class="row xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-3 mx-0 mb-20 mt-0 grid w-full grid-cols-1 justify-start gap-y-3 p-0 gap-x-3" v-if="searchEntries.length > 0">
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