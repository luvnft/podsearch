<template>
  <div class="wrapper">
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { lazyLoad } from "unlazy";

// Apply lazy loading for all images by the selector `img[loading="lazy"]`
lazyLoad();
</script>
