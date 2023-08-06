<template>
  <button
    :class="`items-center font-medium } group flex h-6 h-8 w-6 w-8 items-center justify-center rounded-md
    border border-neutral-300 bg-neutral-100 fill-neutral-400 p-0 text-neutral-400 no-underline shadow-sm ring-neutral-400 hover:bg-neutral-100 active:shadow-sm`"
  >
    <svg-icon name="subtitlesOn" class="h-4 text-gray-400" v-show="props.activated" />
    <svg-icon name="subtitlesOff" class="h-4 text-gray-400" v-show="!props.activated" />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activated: boolean;
}>();
</script>
