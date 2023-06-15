<template>
    <ul class="row tw-flex tw-p-0 tw-m-0 tw-justify-center tw-gap-y-5">
        <li class="col-12" v-for="searchEntry in props.searchEntries" v-if="props.searchEntries">
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
