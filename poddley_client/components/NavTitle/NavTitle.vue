<template>
    <a class="flex items-center justify-center h-10 p-0 text-gray-400 rounded-md w-28 hover:text-gray-500 focus:ring-gray-500 hover:fill-gray-700 focus:outline-none focus:ring-2 focus:ring-inset sm:w-24"
        href="/"
        aria-label="logolink"
        name="logolink">
        
        <IconsSpinnerIcon v-show="loading === true" />
    </a>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
const searchStore = useSearchStore();
const { loading, searchQuery } = storeToRefs(searchStore);

const toHomeClick = () => {
    searchQuery.value = {
        ...searchQuery.value,
            searchString: "",
    };
};
</script>

<style scoped>
:deep(.logo) {
    @apply fill-red-500;
}
</style>
