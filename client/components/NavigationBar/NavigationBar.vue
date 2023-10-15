<template>
    <div class="text-gray-500 flex h-20 w-full gap-2 pb-4 text-base">
        <ButtonsNewButton class="border-gray-300 w-1/2 border border-solid"
            :loading="props.loading && $route.name === 'new'" route="/new" />
        <ButtonsTrendingButton class="border-gray-300 w-1/2 border border-solid"
            :loading="props.loading && $route.name === 'trending'" route="/trending" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    loading: boolean;
}>();
</script>

<style scoped>
@media (prefers-color-scheme: dark) {
    .router-link-exact-active {
        @apply border-l-2;
        @apply border-gray-700;
        @apply bg-neutral-100;
        @apply text-red-700;
    }

    .router-link-exact-active svg {
        @apply dark:fill-gray-300 !important;
    }
}

.router-link-exact-active {
    @apply border-l-2;
    @apply border-gray-700;
    @apply bg-neutral-100;
    @apply text-gray-700;
}

.router-link-exact-active svg {
    @apply fill-gray-700 !important;
}</style>
