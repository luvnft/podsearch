<template>
  <div class="h-full">
    <div class="inset-y-0 left-0 flex h-full w-full items-center">
      <button
        class="text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-transparent focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
      >
        <span class="sr-only">Open search field</span>
        <svg-icon name="magnifyingglass" v-if="!props.openSearchSection" class="block h-full w-full scale-[0.85] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
        <XMarkIcon v-else class="block h-full w-full scale-90 fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  openSearchSection: boolean;
}>();
</script>
