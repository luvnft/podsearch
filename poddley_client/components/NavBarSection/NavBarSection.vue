<template>
  <div class="px-0.5 py-0.5" v-on-click-outside="closeMenus">
    <nav class="bg-white z-40 pb-0 pt-0 shadow-none">
      <div class="mx-auto h-full w-full max-w-7xl px-0 sm:px-6 lg:px-8">
        <div class="relative flex h-full w-full justify-between">
          <div class="my-0 flex h-full w-full flex-1 items-center justify-between sm:items-stretch sm:justify-start">
            <div class="container-fluid flex h-full w-full flex-shrink-0 items-center justify-between p-0">
              <div class="flex h-full w-full flex-nowrap items-center justify-between">
                <div class="flex h-12 w-full">
                  <BurgerMenu class="col-2 flex h-full items-center justify-center" />
                  <DarkMode class="col-2 flex h-full items-center justify-center" />
                  <NavTitle class="col-4 flex h-full items-center justify-center" />
                  <SearchBox class="col-2 flex h-full items-center justify-center p-0" @click="toggleSearchSection" :openSearchSection="openSearchSection" />
                  <ButtonsMicrophoneButton class="col-2 flex h-full items-center justify-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="openSearchSection">
        <SearchBoxSection class="flex h-12 items-center justify-center" />
      </div>
    </nav>
  </div>
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
