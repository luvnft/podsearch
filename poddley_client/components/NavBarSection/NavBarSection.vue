<template>
  <div class="tw-px-1.5 tw-py-0.5">
    <nav class="tw-z-40 tw-border-none tw-bg-white tw-pb-0 tw-pt-0 tw-shadow-none" v-click-outside="closeMenus">
      <div class="tw-mx-auto tw-h-10 tw-max-w-7xl tw-px-0 sm:tw-px-6 lg:tw-px-8">
        <div class="tw-relative tw-flex tw-h-full tw-w-full tw-justify-between">
          <div class="tw-my-0 tw-flex tw-h-full tw-w-full tw-flex-1 tw-items-center tw-justify-between sm:tw-items-stretch sm:tw-justify-start">
            <div class="tw-flex tw-h-12 tw-w-full tw-flex-shrink-0 tw-items-center tw-justify-between tw-gap-0.5">
              <BurgerMenu @click="toggleOpenBurgerMenu" @keyup.spaceup="toggleOpenBurgerMenu()" :openBurgerMenu="openBurgerMenu" />
              <ButtonsDonateButton />
              <NavTitle />
              <SearchBox @click="toggleSearchSection" @keyup.spaceup="toggleSearchSection" :openSearchSection="openSearchSection" />
              <ProfileMenu @click="toggleProfileMenu" @keyup.spaceup="toggleProfileMenu" :openProfileMenu="openProfileMenu" />
            </div>
          </div>
        </div>
      </div>
      <SearchBoxSection v-if="openSearchSection" class="tw-my-[1px] tw-flex tw-h-10 tw-items-center tw-justify-center" />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Disclosure } from "@headlessui/vue";
const openSearchSection: Ref<boolean> = ref(false);
const openBurgerMenu: Ref<boolean> = ref(false);
const openProfileMenu: Ref<boolean> = ref(false);

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

const toggleOpenBurgerMenu = () => {
  if (openBurgerMenu.value) {
    openBurgerMenu.value = false;
  } else {
    closeMenus();
    openBurgerMenu.value = true;
  }
};

const toggleProfileMenu = () => {
  if (openProfileMenu.value) {
    openProfileMenu.value = false;
  } else {
    closeMenus();
    openProfileMenu.value = true;
  }
};
</script>
