<template>
  <Disclosure as="nav" class="bg-white border-gray-200 z-40 border-b pb-0 pt-0">
    <div class="mx-auto h-full w-full px-0 sm:px-6 lg:px-8">
      <div class="relative flex h-full w-full justify-between">
        <div class="my-0 flex h-full w-full flex-1 items-center justify-between sm:items-stretch sm:justify-start">
          <div class="container h-full w-full flex-shrink-0 items-center justify-between p-0">
            <div class="row flex h-full w-full flex-nowrap items-center justify-between">
              <div class="flex h-12 w-full sm:hidden">
                <BurgerMenu class="col-2 flex h-full items-center justify-center" />
                <DarkMode class="col-2 flex h-full items-center justify-center" />
                <NavTitle class="col-4 flex h-full items-center justify-center" />
                <SearchBox class="col-2 flex h-full items-center justify-center p-0" @click="toggleSearchSection" :openSearchSection="openSearchSection" />
                <ButtonsMicrophoneButton class="col-2 flex h-full items-center justify-center" />
              </div>
              <div class="hidden h-12 w-full sm:flex">
                <DesktopNavBar class="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="openSearchSection">
      <SearchBoxSection class="flex h-12 items-center justify-center" />
    </div>
  </Disclosure>
</template>

<script setup lang="ts">
import { onKeyUp } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";

const navigation = [
  { name: "Home", href: "/", current: true, external: false },
  { name: "About", href: "about", current: false, external: false },
  { name: "Contact", href: "/contact", current: false, external: false },
  { name: "Donate", href: "https://www.buymeacoffee.com/poddley", current: false, external: false },
];

const navigateToExternal = (link: string) => (window.location.href = link);

const openSearchSection: Ref<boolean> = ref(false);
const openBurgerMenu: Ref<boolean> = ref(false);
const openProfileMenu: Ref<boolean> = ref(false);

// Custom escape-listener for the searchSeaction
onKeyUp("Escape", () => {
  if (openSearchSection.value) closeMenus();
});

const closeMenus = () => {
  openBurgerMenu.value = false;
  openProfileMenu.value = false;
  // openSearchSection.value = false;
};

const toggleSearchSection = () => {
  if (openSearchSection.value) {
    openSearchSection.value = false;
  } else {
    closeMenus();
    openSearchSection.value = true;
  }
};
</script>
