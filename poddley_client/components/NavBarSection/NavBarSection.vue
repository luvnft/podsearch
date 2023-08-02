<template>
  <div class="tw-px-0.5 tw-py-0.5" v-on-click-outside="closeMenus">
    <nav class="tw-z-40 tw-bg-white tw-pb-0 tw-pt-0 tw-shadow-none dark:tw-bg-gray-900">
      <div class="tw-mx-auto tw-h-full tw-w-full tw-max-w-7xl tw-px-0 sm:tw-px-6 lg:tw-px-8">
        <div class="tw-relative tw-flex tw-h-full tw-w-full tw-justify-between">
          <div class="tw-my-0 tw-flex tw-h-full tw-w-full tw-flex-1 tw-items-center tw-justify-between sm:tw-items-stretch sm:tw-justify-start">
            <div class="container-fluid tw-flex tw-h-full tw-w-full tw-flex-shrink-0 tw-items-center tw-justify-between tw-p-0">
              <div class="tw-flex tw-h-full tw-w-full tw-flex-nowrap tw-items-center tw-justify-between">
                <div class="tw-flex tw-h-12 tw-w-full">
                  <BurgerMenu class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <ButtonsDonateButton class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <NavTitle class="col-4 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <SearchBox class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center tw-p-0" @click="toggleSearchSection" :openSearchSection="openSearchSection" />
                  <ButtonsMicrophoneButton class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="openSearchSection">
        <SearchBoxSection class="tw-flex tw-h-12 tw-items-center tw-justify-center" />
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
  openSearchSection.value = false;
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
