<template>
  <div class="wrapper flex-column flex">
    <!-- <Notification /> -->
    <Notification v-for="toast in toasts" :key="toast.id" :toast="toast" />
    <!-- Rest -->
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Imports
import { useToastProvider, toasts } from "./utils/toastService/useToast";

// Toast functionality global enable it
useToastProvider();

// Key-binding
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
