<template>
  <button
    :class="`group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex h-9 w-9 
    items-center justify-center rounded-lg border p-0 font-medium no-underline shadow-sm hover:bg-neutral-100 active:shadow-sm`"
  >
    <svg-icon name="subtitlesOn" class="h-5 fill-gray-400" v-show="props.activated" />
    <svg-icon name="subtitlesOff" class="h-5 fill-gray-400 group-hover:text-gray-500" v-show="!props.activated" />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  activated: boolean;
}>();
</script>
