<template>
  <div class="mt-3 flex w-full flex-col items-center justify-center text-gray-900">
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