<template>
  <button
    :class="`} group text-neutral-400 bg-neutral-100 border-neutral-300 flex h-6 h-8 w-6 w-8 items-center items-center
    justify-center rounded-md border fill-neutral-400 p-0 font-medium no-underline shadow-sm ring-neutral-400 hover:bg-neutral-100 active:shadow-sm`"
  >
    <svg-icon name="subtitlesOn" class="text-gray-400 h-4" v-show="props.activated" />
    <svg-icon name="subtitlesOff" class="text-gray-400 h-4" v-show="!props.activated" />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activated: boolean;
}>();
</script>
