<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
        @click="toggleColorMode"
        aria-hidden="true"
      >
        <svg-icon v-show="isDark" name="sun" class="min-h-7 mt-0 block h-5 max-h-7 w-4/6 scale-[0.85] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
        <svg-icon v-show="!isDark" name="moon" class="min-h-7 mt-0 block h-5 max-h-7 w-4/6 scale-[0.85] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from "../../store/searchStore";
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};
</script>
