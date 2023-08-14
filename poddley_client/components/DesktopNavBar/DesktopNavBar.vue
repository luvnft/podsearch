<template>
  <div class="flex h-full w-full items-center justify-around">
    <div class="col-4 flex h-full flex-1 items-center justify-center">
      <NuxtLink v-for="link in navigation" :to="link" class="text-gray-700 hidden hover:text-gray-700 lg:flex lg:items-center">
        <span class="ml-3 block text-md font-medium">{{ link }}</span>
      </NuxtLink>
    </div>

    <!-- Logo -->
    <NavTitle class="col-4 flex h-full items-center justify-center" />

    <div class="col-4 flex h-full flex-1 items-center justify-center">
      <DarkMode class="col-2 flex h-full items-center justify-center" />
      <SearchBox class="col-2 flex h-full items-center justify-center p-0" @click="void" :openSearchSection="void" />
      <ButtonsMicrophoneButton class="col-2 flex h-full items-center justify-center" />
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = ["Home", "About", "Contact", "Donate"];
</script>
