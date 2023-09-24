<template>
  <div class="border-gray-200 h-full w-full border-b">
    <div class="flex h-full w-full items-center justify-between gap-x-0">
      <!-- Links -->
      <div class="col-5 m-0 flex h-full items-center gap-x-0 px-0 md:gap-x-5">
        <GenericLink v-for="page in navigation" :link="page.href" class="text-gray-500 mx-0 my-0 flex items-center justify-center text-center text-base font-normal hover:text-gray-600">
          <span class="px-2">
            {{ page.name }}
          </span>
        </GenericLink>
      </div>
      <!-- Logo -->
      <div class="col-2 flex justify-center">
        <NavTitle />
      </div>
      <div class="col-5 flex h-full flex-1 items-center justify-end gap-x-1.5">
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
