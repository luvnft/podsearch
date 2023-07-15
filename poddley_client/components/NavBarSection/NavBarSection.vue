<template>
  <div class="tw-px-0.5 tw-py-0.5">
    <nav class="tw-z-40 tw-border-none tw-bg-white tw-pb-0 tw-pt-0 tw-shadow-none" v-click-outside="closeMenus">
      <div class="tw-mx-auto tw-h-full tw-w-full tw-max-w-7xl tw-px-0 sm:tw-px-6 lg:tw-px-8">
        <div class="tw-relative tw-flex tw-h-full tw-w-full tw-justify-between">
          <div class="tw-my-0 tw-flex tw-h-full tw-w-full tw-flex-1 tw-items-center tw-justify-between sm:tw-items-stretch sm:tw-justify-start">
            <div class="container-fluid tw-flex tw-h-full tw-w-full tw-flex-shrink-0 tw-items-center tw-justify-between tw-p-0">
              <div class="tw-flex tw-h-full tw-w-full tw-flex-nowrap tw-items-center tw-justify-between">
                <div class="tw-flex tw-h-12 tw-w-full">
                  <BurgerMenu @click="toggleOpenBurgerMenu" :openBurgerMenu="openBurgerMenu" class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <ButtonsDonateButton class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <NavTitle class="col-4 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <SearchBox @click="toggleSearchSection" :openSearchSection="openSearchSection" class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                  <ProfileMenu @click="toggleProfileMenu" :openProfileMenu="openProfileMenu" class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SearchBoxSection v-if="openSearchSection" class="tw-my-[1px] tw-flex tw-h-10 tw-items-center tw-justify-center" />
    </nav>
  </div>
</template>

<script setup lang="ts">
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
