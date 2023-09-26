<template>
  <nav class="container-fluid bg-white z-40 px-0 py-0">
    <div class="container-fluid mx-auto h-full w-full max-w-screen px-1.5 lg:px-[20px]">
      <div class="relative flex h-full w-full justify-center">
        <div class="my-0 flex h-full w-full items-center justify-between sm:items-stretch sm:justify-start">
          <div class="m-0 h-full w-full flex-shrink-0 items-center justify-between p-0">
            <div class="m-0 h-full w-full flex-nowrap items-center justify-between">
              <div class="flex w-full items-center justify-between px-0 py-0.5 sm:hidden">
                <div class="flex w-1/3 flex-row items-center justify-start gap-x-4 p-0">
                  <BurgerMenu class="flex items-center justify-center" />
                </div>
                <NavTitle class="flex w-1/3 items-center justify-center" />
                <div class="flex w-1/3 flex-row items-center justify-end gap-x-4 p-0">
                  <ButtonsDarkModeButton class="flex items-center justify-center" />
                </div>
              </div>
              <DesktopNavBar class="m-0 hidden h-16 w-full justify-evenly border-none py-1.5 sm:flex" />
            </div>
          </div>
        </div>
      </div>
      <SearchBoxSection class="h-15 flex items-center justify-center focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus-visible:outline-none" :openSearchSection="openSearchSection" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onKeyUp } from "@vueuse/core";

const openSearchSection: Ref<boolean> = ref(true);
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
