<template>
    <ul class="row mx-0 mb-14 mt-0 grid w-full grid-cols-1 justify-start gap-x-3 gap-y-3 p-0 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        v-if="searchEntries.length > 0">
        <li class="m-0 p-0" v-for="(searchEntry, index) in props.searchEntries">
            <SearchEntry :searchEntry="searchEntry" :key="searchEntry.id" :index="index" />
        </li>
    </ul>
    <div class="m-0 flex h-5 w-full items-center justify-center p-0">
        <IconsSpinnerIcon v-if="loading" />
    </div>
</template>

<script lang="ts" setup>
import { ClientSearchResponseHit } from "../../types/ClientSearchResponse";
import { useSearchStore } from "../../store/searchStore";
import { storeToRefs } from "pinia";

const searchStore = useSearchStore();
const { loading } = storeToRefs(searchStore);
const props = defineProps<{
    searchEntries: ClientSearchResponseHit[];
}>();
</script>
