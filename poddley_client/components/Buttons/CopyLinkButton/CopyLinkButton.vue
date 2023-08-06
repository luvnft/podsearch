<template>
  <div class="flex h-full w-full flex-col justify-center gap-1 text-gray-600 no-underline">
    <button
      @click="handleCopyClick"
      type="button"
      title="copyLinkButton"
      class="items-center font-medium group flex flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 fill-gray-400 p-2 text-gray-400 no-underline shadow hover:bg-gray-100 active:shadow-sm"
    >
      <IconsCopyLinkIcon class="h-6 w-6 group-hover:fill-gray-500 group-hover:text-gray-600" aria-hidden="true" />
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
