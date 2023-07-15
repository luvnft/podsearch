<template>
  <div>
    <div class="tw-inset-y-0 tw-right-0 tw-flex tw-items-center sm:tw-hidden">
      <button
        class="tw-flex tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
      >
        <span class="tw-sr-only">Open profile menu</span>
        <UserCircleIcon v-if="!props.openProfileMenu" class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
        <XMarkIcon v-else class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
      </button>
    </div>
    <div class="tw-absolute tw-right-0 tw-top-10 tw-z-40 tw-ml-0">
      <Menu as="div" class="tw-origin-top-right">
        <TransitionRoot
          :show="props.openProfileMenu"
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
            class="tw-absolute tw-right-0 tw-z-40 tw-w-40 tw-origin-top-right tw-rounded-md tw-bg-white tw-py-1 tw-text-right tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
          >
            <MenuItem v-slot="{ active }">
              <NuxtLink to="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Login</NuxtLink>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <NuxtLink to href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Sign up</NuxtLink>
            </MenuItem>
          </MenuItems>
        </TransitionRoot>
      </Menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from "@headlessui/vue";
import { Bars3Icon, BellIcon, XMarkIcon, UserCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  openProfileMenu: boolean;
}>();

const client = useSupabaseAuthClient();
const user = useSupabaseUser();

const logout = async () => {
  await client.auth.signOut();
  navigateTo("/login");
};

const login = async () => {
  navigateTo("/login");
};
</script>
