<template>
  <button
    :class="`items-center font-medium } tw-group tw-flex tw-h-6 tw-h-8 tw-w-6 tw-w-8 tw-items-center tw-justify-center tw-rounded-md
    tw-border tw-border-gray-300 tw-bg-gray-100 tw-fill-gray-400 tw-p-0 tw-text-gray-400 tw-no-underline tw-shadow tw-ring-gray-400 hover:tw-bg-gray-100 active:tw-shadow-sm`"
  >
    <svg-icon name="subtitlesOn" class="tw-h-4 tw-text-gray-400" v-show="props.activated" />
    <svg-icon name="subtitlesOff" class="tw-h-4 tw-text-gray-400" v-show="!props.activated" />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activated: boolean;
}>();
</script>
