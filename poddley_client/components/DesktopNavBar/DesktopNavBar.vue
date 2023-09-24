<template>
  <div class="border-b border-gray-200 h-full w-full">
    <div class="container-fluid mx-auto flex h-full items-center justify-between">
      <!-- Links -->
      <div class="flex-grow h-full flex items-center md:gap-x-5">
        <GenericLink v-for="page in navigation" :key="page.name" :link="page.href" class="text-gray-500 mx-0 my-0 flex items-center justify-center text-center text-base font-normal hover:text-gray-600">
          <span class="px-2">
            {{ page.name }}
          </span>
        </GenericLink>
      </div>
      <!-- Logo -->
      <div class="w-1/5 flex justify-center">
        <NavTitle />
      </div>
      <!-- Right Section -->
      <div class="flex-grow h-full flex items-center justify-end md:gap-x-5">
        <!-- Links -->
        <GenericLink :link="donateLink" class="text-gray-500 mx-0 my-0 flex items-center justify-center text-center text-base font-normal hover:text-gray-600">
          <span class="px-2">Support us</span>
        </GenericLink>
        <!-- DarkMode -->
        <ButtonsDarkModeButton aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { name: "Home", href: "/", current: true, external: false },
  { name: "About", href: "about", current: false, external: false },
  { name: "Contact", href: "/contact", current: false, external: false },
];

const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>
