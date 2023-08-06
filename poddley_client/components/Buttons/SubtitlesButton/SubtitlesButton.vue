<template>
  <button
    :class="`items-center font-medium } group flex h-6 h-8 w-6 w-8 items-center justify-center rounded-md
    border border-gray-300 bg-gray-100 fill-gray-400 p-0 text-gray-400 no-underline shadow-sm ring-gray-400 hover:bg-gray-100 active:shadow-sm`"
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
