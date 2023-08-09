<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="flex h-full w-full items-center justify-center rounded-md p-2 text-gray-400 hover:border-none hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        @click="toggleColorMode"
        aria-hidden="true"
      >
        <svg-icon v-show="isDark" name="sun" class="min-h-7 mt-0 h-5 max-h-7 w-4/6" />
        <svg-icon v-show="!isDark" name="moon" class="mt-0 h-5 max-h-7 w-4/6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
const searchStore = useSearchStore();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};
</script>
