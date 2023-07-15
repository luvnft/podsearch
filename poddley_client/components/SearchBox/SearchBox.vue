<template>
  <div class="tw-inset-y-0 tw-left-0 tw-flex tw-items-center sm:tw-hidden">
    <button
      class="tw-flex tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
    >
      <span class="tw-sr-only">Open search field</span>
      <IconsMagnifyingGlass v-if="!props.showSearchSection" class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
      <XMarkIcon v-else class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  showSearchSection: boolean;
}>();
</script>
