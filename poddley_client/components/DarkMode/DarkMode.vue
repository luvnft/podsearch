<template>
  <GenericButton @click="toggleColorMode" class = "w-10">
    <div class="flex items-center justify-center h-full w-10">
      <div class="sun flex h-full w-10 items-center justify-center">
        <svg-icon name="sun" class="sun block h-full scale-[0.5] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
      </div>
      <div class="moon flex h-full w-10 items-center justify-center">
        <svg-icon name="moon" class="moon block h-full scale-[0.5] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </div>
    </div>
  </GenericButton>
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
