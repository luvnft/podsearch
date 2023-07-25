<template>
  <div class="tw-flex tw-h-full tw-w-full tw-flex-col tw-justify-center tw-gap-1 tw-text-gray-600 tw-no-underline">
    <button
      @click="handleCopyClick"
      type="button"
      title="copyLinkButton"
      class="items-center font-medium tw-group tw-flex tw-flex-col tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200 tw-bg-gray-50 tw-fill-gray-400 tw-p-2 tw-text-gray-400 tw-no-underline tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm"
    >
      <IconsCopyLinkIcon class="tw-h-6 tw-w-6 group-hover:tw-fill-gray-500 group-hover:tw-text-gray-600" aria-hidden="true" />
    </button>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  segmentId: string;
}>();

const textVisible: Ref<Boolean> = ref(false);

async function handleCopyClick() {
  navigator.clipboard.writeText(useRuntimeConfig().public.HOMEPAGE + "/quote?id=" + props.segmentId);
  showText();
}

function showText() {
  textVisible.value = true;
  setTimeout(() => {
    textVisible.value = false;
  }, 2000);
}
</script>
