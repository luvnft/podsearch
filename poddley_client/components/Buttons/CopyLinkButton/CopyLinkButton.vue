<template>
  <div class="tw-m-0 tw-flex tw-flex-row tw-items-center tw-gap-1 tw-text-gray-600 tw-no-underline">
    <button
      @click="handleCopyClick"
      type="button"
      title="copyLinkButton"
      class="tw-flex items-center font-medium tw-group tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-gray-200 tw-bg-gray-50 tw-fill-gray-400 tw-p-2 tw-text-gray-400 tw-no-underline tw-shadow hover:tw-bg-gray-100 active:tw-shadow-sm"
    >
      <IconsCopyLinkIcon class="tw-h-6 tw-w-6 group-hover:tw-fill-gray-500 group-hover:tw-text-gray-600" aria-hidden="true" />
      <span v-if="!textVisible" class="tw-text-gray-500 group-hover:tw-text-gray-600 group-active:tw-text-gray-600">copy</span>
      <span v-if="textVisible">copied</span>
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