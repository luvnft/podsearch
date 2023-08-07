<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="text-gray-400 flex h-full w-full items-center justify-center rounded-md p-0 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset"
        @click="toggleColorMode"
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
const { loading, searchQuery } = storeToRefs(searchStore);

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};
</script>
