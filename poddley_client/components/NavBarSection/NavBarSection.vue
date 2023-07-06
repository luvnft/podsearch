<template>
  <div @focusout="closeMenus" class = "tw-px-2">
    <Disclosure as="nav" class="tw-z-40 tw-border-none tw-bg-white tw-shadow-none">
      <div class="tw-mx-auto tw-max-w-7xl tw-px-0 sm:tw-px-6 lg:tw-px-8">
        <div class="tw-relative tw-flex tw-justify-between tw-h-10">
          <div class="tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center sm:tw-hidden">
            <!-- Mobile menu button -->
            <DisclosureButton
              class="tw-flex tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
              @click="toggleOpenBurgerMenu"
            >
              <span class="tw-sr-only">Open main menu</span>
              <Bars3Icon v-if="!openBurgerMenu" class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
              <XMarkIcon v-else class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
          <div class="tw-flex tw-flex-1 tw-items-center tw-justify-center sm:tw-items-stretch sm:tw-justify-start">
            <div class="tw-flex tw-flex-shrink-0 tw-items-center">
              <NavTitle class="tw-scale-75" />
            </div>
            <div class="tw-hidden sm:tw-ml-6 sm:tw-flex sm:tw-space-x-8">
              <a href="#" class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-gray-500 tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-900 tw-no-underline">About</a>
              <a
                href="#"
                class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 tw-no-underline hover:tw-border-gray-300 hover:tw-text-gray-700"
              >
                Contact
              </a>
              <a
                href="#"
                class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 tw-no-underline hover:tw-border-gray-300 hover:tw-text-gray-700"
              >
                Donate
              </a>
              <a
                href="#"
                class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 tw-no-underline hover:tw-border-gray-300 hover:tw-text-gray-700"
              >
                API
              </a>
            </div>
          </div>
          <div class="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-px-2 tw-pr-0 sm:tw-static sm:tw-inset-auto sm:tw-ml-6 sm:tw-pr-0">
            <button
              type="button"
              class="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-p-1 tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500 focus:tw-ring-offset-2"
            >
              <div class="tw-h-[26px] tw-w-[26px]">
                <span class="tw-sr-only">View notifications</span>
                <BellIcon class="tw-mx-0 tw-mt-0 tw-px-0" aria-hidden="true" />
              </div>
            </button>

            <!-- Profile dropdown -->
            <Menu as="div" class="tw-z-40 tw-ml-0 tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center">
              <div>
                <MenuButton
                  class="tw-flex tw-h-6 tw-w-6 tw-justify-center tw-rounded-full tw-bg-white tw-bg-cover tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500 focus:tw-ring-offset-2"
                  @click="toggleProfileMenu"
                  :style="`background-image: url('https://scontent.fosl3-1.fna.fbcdn.net/v/t39.30808-6/274350608_3078571592460508_8847747205312988074_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=8BTMjp2O2eEAX9GSGKb&_nc_ht=scontent.fosl3-1.fna&oh=00_AfBx-_i_BVui117fj6ZFHJd7-XkYHr2xKBvbKATSXoHWCA&oe=64ABA2F9')`"
                >
                  <span class="tw-sr-only">Open user menu</span>
                </MenuButton>
              </div>
              <transition
                enter-active-class="tw-transition tw-ease-out tw-duration-200"
                enter-from-class="tw-transform tw-opacity-0 tw-scale-95"
                enter-to-class="tw-transform tw-opacity-100 tw-scale-100"
                leave-active-class="tw-transition tw-ease-in tw-duration-75"
                leave-from-class="tw-transform tw-opacity-100 tw-scale-100"
                leave-to-class="tw-transform tw-opacity-0 tw-scale-95"
                v-show="openProfileMenu"
              >
                <div v-show="openProfileMenu">
                  <MenuItems
                    static
                    class="tw-absolute tw-right-0 tw-z-10 tw-mt-0 tw-w-40 tw-origin-top-right tw-rounded-md tw-bg-white tw-py-1 tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
                  >
                    <MenuItem v-slot="{ active }">
                      <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">About</a>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Settings</a>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Sign out</a>
                    </MenuItem>
                  </MenuItems>
                </div>
              </transition>
            </Menu>
          </div>
        </div>
        <SearchBoxSection />
      </div>

      <!-- Burger dropdown -->
      <div class="tw-absolute tw-left-0 tw-z-40 tw-ml-2">
        <Menu as="div" class="tw-origin-top-left">
          <TransitionRoot
            :show="openBurgerMenu"
            enter="tw-transition tw-ease-out tw-duration-500 tw-z-40"
            enter-from="tw-transform tw-opacity-0 tw-scale-95"
            enter-to="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leave-from="tw-transform tw-opacity-100 tw-scale-100"
            leave-to="tw-transform tw-opacity-0 tw-scale-95"
            class="tw-z-40"
          >
            <MenuItems
              static
              class="tw-absolute -tw-top-[34px] tw-left-0 tw-z-40 tw-w-40 tw-origin-top-left tw-rounded-md tw-bg-white tw-py-1 tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
            >
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">About</a>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Settings</a>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Sign out</a>
              </MenuItem>
            </MenuItems>
          </TransitionRoot>
        </Menu>
      </div>
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from "@headlessui/vue";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const openBurgerMenu: Ref<boolean> = ref(false);
const openProfileMenu: Ref<boolean> = ref(false);
const closeMenus = () => {
  openBurgerMenu.value = false;
  openProfileMenu.value = false;
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
