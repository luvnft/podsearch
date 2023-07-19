<template>
  <ul class="row tw-m-0 tw-flex tw-justify-center tw-gap-y-5 tw-p-0">
    <li class="col-12 tw-max-w-md tw-p-0 md:tw-p-2" v-for="(searchEntry, index) in props.searchEntries">
      <SearchEntry :searchEntry="searchEntry" />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { Hit } from "@/types/SearchResponse";
const props = defineProps<{
  searchEntries: Hit[];
}>();
</script>
