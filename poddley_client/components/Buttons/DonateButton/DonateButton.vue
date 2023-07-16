<template>
  <div class="tw-h-full">
    <div class="tw-inset-y-0 tw-left-0 tw-flex tw-h-full tw-w-full tw-items-center sm:tw-hidden">
      <a
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-fill-gray-400 tw-p-2 hover:tw-bg-gray-100 hover:tw-fill-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
        :href="donateLink"
      >
        <span class="tw-sr-only">Donate button</span>
        <IconsDonateIcon class="tw-block tw-h-full tw-w-full tw-scale-75 tw-fill-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>
