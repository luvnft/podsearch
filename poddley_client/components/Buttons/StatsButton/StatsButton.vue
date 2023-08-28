<template>
  <button
    type="button"
    title="statsButton"
    class="items-center font-medium group flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 fill-gray-400 p-2 shadow hover:bg-gray-100 active:shadow-sm"
  >
    <svg-icon name="stats" class="h-6 w-6 scale-90 text-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup lang="ts"></script>
