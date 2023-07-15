<template>
  <div class="tw-inset-y-0 tw-right-0 tw-flex tw-items-center sm:tw-hidden">
    <a
      class="tw-flex tw-items-center tw-justify-center tw-rounded-md tw-fill-gray-400 tw-p-2 hover:tw-bg-gray-100 hover:tw-fill-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
      :href="donateLink"
      @click.prevent="donateLinkClick"
      @keyup.space.prevent="donateLinkClick"
    >
      <span class="tw-sr-only">Donate button</span>
      <IconsDonateIcon class="tw-block tw-h-6 tw-w-6 tw-scale-[0.8] tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
    </a>
  </div>
</template>

<script setup lang="ts">
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
function donateLinkClick(event: any) {
  event.preventDefault();
  event.stopPropagation();
  window.location.href = donateLink.value;
}
</script>
