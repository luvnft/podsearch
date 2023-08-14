<template>
  <NuxtLink :to="props.link" class="m-0 rounded-sm p-2">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: string;
}>();
</script>
