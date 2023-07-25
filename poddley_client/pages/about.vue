<template>
  <div class="tw-mt-3 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center">
    <h1>About</h1>
    {{ 
      $colorMode.value
    }}
    <p class="tw-text-gray-80 dark:tw-text-blue-800">We like podcasts</p>
  </div>
</template>

<script setup lang = "ts">
definePageMeta({
  colorMode: 'dark',
})
</script>