<template>
  <ButtonsGenericButton @click="toggleColorMode" class="aspect-square h-10" name="darkModeButton">
    <div class="flex aspect-square h-10 w-full items-center justify-center">
      <div class="moon flex h-full w-full items-center justify-center">
        <svg-icon name="moon" class="flex h-full w-3/5 justify-center fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </div>
      <div class="sun flex h-full w-full items-center justify-center">
        <svg-icon name="sun" class="flex h-full w-3/5 justify-center fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
      </div>
    </div>
  </ButtonsGenericButton>
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
