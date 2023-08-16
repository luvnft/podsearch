<template>
  <button
    :class="`} group text-neutral-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex h-10 w-10 items-center
    items-center justify-center rounded-md border fill-neutral-400 p-0 font-medium no-underline shadow-sm hover:bg-neutral-100 active:shadow-sm`"
  >
    <svg-icon name="subtitlesOn" class="text-gray-400 h-5" v-show="props.activated" />
    <svg-icon name="subtitlesOff" class="text-gray-400 h-5" v-show="!props.activated" />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activated: boolean;
}>();
</script>
