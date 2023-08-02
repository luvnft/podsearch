<template>
  <div class="tw-mt-3 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-text-gray-900 dark:tw-text-white">
    <h1>About</h1>
    {{ 
      $colorMode.value
    }}
    <p>We like podcasts</p>
  </div>
</template>

<script setup lang = "ts">
definePageMeta({
  colorMode: 'dark',
})
</script>