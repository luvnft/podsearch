<template>
  <div class="wrapper">
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  const handleSpacebarClick = (event) => {
    if (event.code === "Space" && (event.target.tagName === "BUTTON" || event.target.tagName === "A")) {
      event.preventDefault();
      event.stopPropagation();
      const eventType = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      event.target.dispatchEvent(eventType);
    }
  };

  document.addEventListener("keydown", handleSpacebarClick);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleSpacebarClick);
  });
  
  
});
</script>
