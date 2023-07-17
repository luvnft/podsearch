<template>
  <div class="tw-h-full">
    <HeadlessMenu as="div" class="tw-inset-y-0 tw-right-0 tw-flex tw-h-full tw-w-full tw-origin-top-left tw-items-center sm:tw-hidden" v-slot="{ open, close }">
      <HeadlessMenuButton
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
      >
        <span class="tw-sr-only">Open main menu</span>
        <Bars3Icon v-if="!open" class="tw-h-full tw-w-full tw-scale-90" aria-hidden="true" />
        <XMarkIcon v-else class="tw-block tw-h-full tw-w-full tw-scale-90" aria-hidden="true" />
      </HeadlessMenuButton>
      <transition
        enter-active-class="tw-transition tw-duration-100 tw-ease-out"
        enter-from-class="tw-transform tw-scale-95 tw-opacity-0"
        enter-to-class="tw-transform tw-scale-100 tw-opacity-100"
        leave-active-class="tw-transition tw-duration-75 tw-ease-in"
        leave-from-class="tw-transform tw-scale-100 tw-opacity-100"
        leave-to-class="tw-transform tw-scale-95 tw-opacity-0"
      >
        <HeadlessMenuItems
          class="tw-absolute tw-left-0 tw-top-12 tw-z-40 tw-w-40 tw-origin-top-left tw-rounded-md tw-bg-white tw-py-1 tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
          @click="close"
        >
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink to="login" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Login/Signup</NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" v-if="user">
            <button @click="logout" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-no-underline']">Logout</button>
          </HeadlessMenuItem>
        </HeadlessMenuItems>
      </transition>
    </HeadlessMenu>
  </div>
</template>

<script setup lang="ts">
import { Bars3Icon, BellIcon, XMarkIcon, UserCircleIcon } from "@heroicons/vue/24/outline";

const client = useSupabaseAuthClient();
const user = useSupabaseUser();

const logout = async () => {
  await client.auth.signOut();
};
</script>
