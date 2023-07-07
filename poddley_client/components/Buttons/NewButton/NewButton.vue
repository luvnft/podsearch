<template>
  <NuxtLink
    type="button"
    :class="`items-center font-medium tw-group tw-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200  ${
      $route.name !== route ? 'tw-bg-gray-50' : 'tw-border-gray-400 tw-bg-gray-100'
    } tw-fill-gray-400 tw-p-2 tw-text-gray-400 tw-no-underline tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm`"
    :to="route"
  >
    <!-- <IconsNewIcon class="tw-h-6 tw-w-6 tw-scale-90 tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" v-if="!props.loading" /> -->
    <span class="tw-text-center tw-text-gray-500 group-hover:tw-text-gray-600 group-active:tw-text-gray-600" v-if="!props.loading">New podcasts</span>
    <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="props.loading" />
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  loading: boolean;
  route: string;
}>();
</script>
