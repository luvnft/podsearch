<template>
  <ButtonsGenericButton class="w-12">
    <span class="sr-only">Open search field</span>
    <svg-icon name="magnifyingglass" v-if="!props.openSearchSection" class="block h-12 w-12 scale-[0.60] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
    <XMarkIcon v-else class="block h-full scale-[0.60] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
  </ButtonsGenericButton>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  openSearchSection: boolean;
}>();
</script>
