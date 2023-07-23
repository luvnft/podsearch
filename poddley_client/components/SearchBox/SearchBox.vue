<template>
  <div class="tw-h-full">
    <div class="tw-inset-y-0 tw-left-0 tw-flex tw-h-full tw-w-full tw-items-center sm:tw-hidden">
      <button
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-border-none hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
      >
        <span class="tw-sr-only">Open search field</span>
        <svg-icon name="magnifyingglass" v-if="!props.openSearchSection" class="tw-block tw-h-full tw-w-full tw-scale-[0.85] tw-fill-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
        <XMarkIcon v-else class="tw-block tw-h-full tw-w-full tw-scale-90 tw-fill-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
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
