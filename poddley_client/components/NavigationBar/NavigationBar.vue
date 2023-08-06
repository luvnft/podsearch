<template>
  <div class="flex h-20 w-full gap-2 pb-4 text-base text-gray-500">
    <ButtonsNewButton class="w-1/2 border border-solid border-gray-300" :loading="props.loading && $route.name === 'new'" route="/new" />
    <ButtonsTrendingButton class="w-1/2 border border-solid border-gray-300" :loading="props.loading && $route.name === 'trending'" route="/trending" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  loading: boolean;
}>();
</script>
