<template>
  <div>
    <div class="tw-inset-y-0 tw-left-0 tw-flex tw-items-center sm:tw-hidden" v-click-outside="closeMenus">
      <!-- Mobile menu button -->
      <DisclosureButton
        class="tw-flex tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
        @click="toggleOpenBurgerMenu"
        @keyup.space="toggleOpenBurgerMenu"
      >
        <span class="tw-sr-only">Open main menu</span>
        <Bars3Icon v-if="!openBurgerMenu" class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
        <XMarkIcon v-else class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
      </DisclosureButton>
    </div>
    <!-- Mobile menu dropdown -->
    <div class="tw-absolute tw-left-0 tw-top-10 tw-z-40 tw-ml-0">
      <Menu as="div" class="tw-origin-top-left">
        <TransitionRoot
          :show="openBurgerMenu"
          enter="tw-transition tw-ease-out tw-duration-500 tw-z-40"
          enter-from="tw-transform tw-opacity-0 tw-scale-95"
          enter-to="tw-transform tw-opacity-100 tw-scale-100"
          leave="tw-transition tw-ease-in tw-duration-75"
          leave-from="tw-transform tw-opacity-100 tw-scale-100"
          leave-to="tw-transform tw-opacity-0 tw-scale-95"
          class="tw-relative tw-right-0 tw-top-1 tw-z-40"
        >
          <MenuItems
            static
            class="tw-absolute tw-left-0 tw-z-40 tw-w-40 tw-origin-top-left tw-rounded-md tw-bg-white tw-py-1 tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
          >
            <MenuItem v-slot="{ active }">
              <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">About</a>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Contact</a>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Donate</a>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">API</a>
            </MenuItem>
          </MenuItems>
        </TransitionRoot>
      </Menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from "@headlessui/vue";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const openBurgerMenu: Ref<boolean> = ref(false);

const toggleOpenBurgerMenu = () => {
  if (openBurgerMenu.value) {
    openBurgerMenu.value = false;
  } else {
    closeMenus();
    openBurgerMenu.value = true;
  }
};

const closeMenus = () => {
  console.log("outside");
  openBurgerMenu.value = false;
};
</script>
