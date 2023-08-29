<template>
    <ul class="row mx-0 mb-20 mt-0 flex w-full justify-center gap-x-0 gap-y-0 p-0 sm:py-2" v-if="searchEntries.length > 0">
        <li class="col-12 w-full p-0" v-for="(searchEntry, index) in props.searchEntries">
            <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" />
        </li>
    </ul>
    <p v-else class="text-gray-800 mt-4 text-center">No results for the given search query.</p>
</template>

<script lang="ts" setup>
import { Hit } from "../../types/SearchResponse";
const props = defineProps<{
    searchEntries: Hit[];
}>();
</script>
