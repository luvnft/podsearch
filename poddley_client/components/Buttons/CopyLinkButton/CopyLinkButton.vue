<template>
  <div class="text-gray-600 flex h-full w-full flex-col justify-center gap-1 no-underline">
    <button
      @click="handleCopyClick"
      type="button"
      title="copyLinkButton"
      class="group text-gray-400 bg-gray-50 border-gray-200 flex flex-col items-center justify-center rounded-md border fill-gray-400 p-2 font-medium no-underline shadow hover:bg-gray-100 active:shadow-sm"
    >
      <svg-icon name="copylink" class="h-5 w-5 fill-gray-400 p-0.5 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" aria-hidden="true" />
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
