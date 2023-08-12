<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="group flex h-full w-full items-center justify-center rounded-md p-2 text-gray-400 hover:border-none hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        @click="toggleColorMode"
        aria-hidden="true"
      >
          <svg-icon v-if="isDark" name="sun" class="block h-full w-full scale-[0.7] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
          <svg-icon v-if="!isDark" name="moon" class="block h-full w-full scale-[0.67] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};
</script>
