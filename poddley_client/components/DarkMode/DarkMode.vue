<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="group text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
        @click="toggleColorMode"
        aria-hidden="true"
      >
        <div v-show="isDark">
          <svg-icon name="sun" class="block h-full w-full scale-[0.5] fill-gray-400 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" aria-hidden="true" />
        </div>
        <div v-show="!isDark">
          <svg-icon name="moon" class="block h-full w-full scale-[0.33] fill-gray-500 group-hover:fill-gray-400" aria-hidden="true" />
        </div>
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
