<template>
    <NuxtLink :to="props.link"
        class="text-gray-400 h-10 rounded-md hover:text-gray-500 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset">
        <slot />
    </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
    link: string;
}>();
</script>
