<template>
  <a
    :href="`mailto:${contactEmail}`"
    class="tw-font-medium tw-group tw-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200 tw-bg-gray-50 tw-fill-gray-400 tw-p-2 tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm"
  >
    <button type="button" title="contactButton">
      <IconsContactIcon class="tw-h-6 tw-w-6 tw-scale-90 tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
    </button>
  </a>
</template>

<script lang="ts" setup>
const contactEmail = "luka_momcilovic@hotmail.com";
</script>
