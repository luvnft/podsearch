<template>
    <NuxtLink :to="props.link" class="flex h-full w-full flex-col justify-center gap-1 text-gray-600 no-underline">
        <button type="button" title="podcastButton"
            class="font-medium group flex flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 fill-gray-400 p-2 shadow hover:bg-gray-100 active:shadow-sm">
            <svg-icon name="podcast" class="h-6 w-6 gap-1 text-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
        </button>
    </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
    link: string;
}>();
</script>
