<template>
  <div class="h-full">
    <div class="inset-y-0 left-0 flex h-full w-full items-center">
      <a
        class="flex h-full w-full items-center justify-center rounded-md fill-gray-400 p-2 hover:bg-gray-100 hover:fill-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
        :href="donateLink"
      >
        <span class="sr-only">Donate button</span>
        <svg-icon name="donate" class="block h-full w-full scale-[0.79] fill-gray-400 p-[1px] group-hover:fill-gray-500" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>
