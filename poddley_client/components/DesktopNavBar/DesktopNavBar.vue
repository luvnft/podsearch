<template>
  <div class="flex h-full w-full items-center justify-around">
    <!-- Links -->
    <div class="col-5 flex h-full items-center justify-center">
      <div class="flex h-full w-60 flex-row justify-center">
        <GenericLink v-for="link in navigation" :link="link.href" class="col-3 group text-gray-500 ring-gray-800 mx-0 flex items-center justify-center">
          <span class="text-gray-500 m-0 p-0 font-medium group-hover:text-gray-700">{{ link.name }}</span>
        </GenericLink>
      </div>
    </div>

    <!-- Logo -->
    <NavTitle class="col-2 flex h-full items-center justify-center" />

    <!-- Buttons -->
    <div class="col-5 flex h-full items-center justify-center">
      <div class="flex h-full w-20 flex-row justify-center">
        <DarkMode class="col-4 flex h-full w-3/4 items-center justify-center" />
        <!-- <SearchBox class="col-4 flex h-full w-3/4 items-center justify-center p-0" @click="void" :openSearchSection="void" />
        <ButtonsMicrophoneButton class="col-4 flex h-full w-3/4 items-center justify-center" /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { name: "Home", href: "/", current: true, external: false },
  { name: "About", href: "about", current: false, external: false },
  { name: "Contact", href: "/contact", current: false, external: false },
  { name: "Donate", href: "https://www.buymeacoffee.com/poddley", current: false, external: false },
];
</script>
