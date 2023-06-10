<template>
  <div class="tw-flex tw-h-20 tw-w-full tw-gap-2 tw-pb-4 tw-text-base tw-text-gray-500">
    <ButtonsNewButton class="tw-w-1/2 tw-border tw-border-solid tw-border-gray-300" :loading="props.loading && $route.name === 'new'" route="new" />
    <ButtonsTrendingButton class="tw-w-1/2 tw-border tw-border-solid tw-border-gray-300" :loading="props.loading && $route.name === 'trending'" route="trending" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  loading: boolean;
}>();
</script>
