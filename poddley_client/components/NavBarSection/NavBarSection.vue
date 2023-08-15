<template>
  <nav class="container-fluid bg-white z-40 px-3 sm:px-10">
    <div class="mx-auto h-full w-full px-0 sm:px-6 lg:px-8 ">
      <div class="relative flex h-full w-full justify-center">
        <div class="my-0 flex h-full w-full items-center justify-between sm:items-stretch sm:justify-start lg:max-w-screen-xl">
          <div class="m-0 h-full w-full flex-shrink-0 items-center justify-between p-0">
            <div class="m-0 h-full w-full flex-nowrap items-center justify-between">
              <div class="row m-0 flex h-12 w-full flex-col items-center justify-center sm:hidden">
                <div class="flex w-full justify-between p-0">
                  <BurgerMenu class="col-2" />
                  <DarkMode class="col-2" />
                  <NavTitle class="col-4" />
                  <ButtonsMicrophoneButton class="col-2" />
                  <SearchBox @click="toggleSearchSection" :openSearchSection="openSearchSection" class="col-2" />
                </div>
              </div>
              <DesktopNavBar class="m-0 hidden h-16 w-full justify-evenly sm:flex py-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="openSearchSection">
      <SearchBoxSection class="flex h-12 items-center justify-center" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onKeyUp } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";

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
