<template>
  <div>
    <div class="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <button
        class="group text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
        @click="toggleColorMode"
        aria-hidden="true"
      >
        <div class="sun h-full w-full">
          <svg-icon name="sun" class="block h-full w-full scale-[0.7] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
        </div>
        <div class="moon h-full w-full">
          <svg-icon name="moon" class="block h-full w-full scale-[0.67] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
        </div>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode();

const toggleColorMode = () => {
  if (colorMode.unknown === false) {
    if (colorMode.preference === "system") {
      colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
    } else {
      colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
    }
  }
};
</script>

<style scoped>
/* This allows instant beforeRender iconSwitch 😎 */
.light .sun {
  display: none !important;
}

.dark .moon {
  display: none !important;
}
</style>
