<template>
        <svg-icon name="sun" class="sun block h-full scale-[0.55] fill-gray-500 group-hover:fill-gray-500 dark:group-hover:fill-gray-400" aria-hidden="true" />
        <svg-icon name="moon" class="moon block h-full scale-[0.5] fill-gray-500 group-hover:fill-gray-500" aria-hidden="true" />
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