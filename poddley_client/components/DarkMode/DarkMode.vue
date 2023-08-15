<template>
  <GenericButton @click="toggleColorMode" class="h-12 w-12 aspect-square">
    <div class="flex h-12 w-12 items-center justify-center aspect-square">
      <div class="sun flex h-full w-12 items-center justify-center aspect-square">
        <svg-icon name="sun" class="sun block h-full scale-[0.5] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
      </div>
      <div class="moon flex h-full w-12 items-center justify-center aspect-square">
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
