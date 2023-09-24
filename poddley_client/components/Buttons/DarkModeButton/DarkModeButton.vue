<template>
  <ButtonsGenericButton @click="toggleColorMode" class="aspect-square h-12 w-12">
        <svg-icon name="sun" class="sun block h-full scale-[0.55] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
  </ButtonsGenericButton>
</template>
<script setup lang="ts">
const colorMode = useColorMode();

const toggleColorMode = () => {
console.log(colorMode);
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
}

.dark .moon {
}
</style>
