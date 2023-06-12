<template>
  <NuxtLink :to="props.link" class="tw-flex tw-flex-row tw-items-center tw-gap-1 tw-text-gray-600 tw-no-underline">
    <button
      type="button"
      title="podcastButton"
      class="d-flex items-center font-medium tw-group tw-flex tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200 tw-bg-gray-50 tw-fill-gray-400 tw-p-2 tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm"
    >
      <IconsPodcastIcon class="tw-h-6 tw-w-6 tw-gap-1 tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
      <span>ep.</span>
    </button>
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  link: string;
}>();
</script>
