<template>
  <NuxtLink :to="props.link" class="text-gray-400 h-12 rounded-md font-semibold hover:text-gray-500 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset px-1.5">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: string;
}>();
</script>
