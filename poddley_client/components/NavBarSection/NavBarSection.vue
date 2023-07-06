<template>
  <Disclosure as="nav" class="tw-bg-white tw-shadow-none tw-border-none" v-slot="{ open }">
    <div class="tw-mx-auto tw-max-w-7xl tw-px-2 sm:tw-px-6 lg:tw-px-8">
      <div class="tw-relative tw-flex tw-h-16 tw-justify-between">
        <div class="tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center sm:tw-hidden">
          <!-- Mobile menu button -->
          <DisclosureButton
            class="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-p-2 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-500"
          >
            <span class="tw-sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
            <XMarkIcon v-else class="tw-block tw-h-6 tw-w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="tw-flex tw-flex-1 tw-items-center tw-justify-center sm:tw-items-stretch sm:tw-justify-start">
          <div class="tw-flex tw-flex-shrink-0 tw-items-center">
            <NavTitle class="tw-scale-[0.8]" />
          </div>
          <div class="tw-hidden sm:tw-ml-6 sm:tw-flex sm:tw-space-x-8">
            <!-- Current: "tw-border-indigo-500 tw-text-gray-900", Default: "tw-border-transparent tw-text-gray-500 hover:tw-border-gray-300 hover:tw-text-gray-700" -->
            <a href="#" class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-indigo-500 tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-900">Dashboard</a>
            <a
              href="#"
              class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-text-gray-700"
            >
              Team
            </a>
            <a
              href="#"
              class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-text-gray-700"
            >
              Projects
            </a>
            <a
              href="#"
              class="tw-inline-flex tw-items-center tw-border-b-2 tw-border-transparent tw-px-1 tw-pt-1 tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-text-gray-700"
            >
              Calendar
            </a>
          </div>
        </div>
        <div class="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-2 sm:tw-static sm:tw-inset-auto sm:tw-ml-6 sm:tw-pr-0">
          <button
            type="button"
            class="tw-rounded-full tw-bg-white tw-p-1 tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
          >
            <span class="tw-sr-only">View notifications</span>
            <BellIcon class="tw-h-6 tw-w-6" aria-hidden="true" />
          </button>

          <!-- Profile dropdown -->
          <Menu as="div" class="tw-relative tw-ml-3">
            <div>
              <MenuButton class="tw-flex tw-rounded-full tw-bg-white tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2">
                <span class="tw-sr-only">Open user menu</span>
                <img
                  class="tw-h-8 tw-w-8 tw-rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </MenuButton>
            </div>
            <transition
              enter-active-class="tw-transition tw-ease-out tw-duration-200"
              enter-from-class="tw-transform tw-opacity-0 tw-scale-95"
              enter-to-class="tw-transform tw-opacity-100 tw-scale-100"
              leave-active-class="tw-transition tw-ease-in tw-duration-75"
              leave-from-class="tw-transform tw-opacity-100 tw-scale-100"
              leave-to-class="tw-transform tw-opacity-0 tw-scale-95"
            >
              <MenuItems
                class="tw-absolute tw-right-0 tw-z-10 tw-mt-2 tw-w-48 tw-origin-top-right tw-rounded-md tw-bg-white tw-py-1 tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700']">Your Profile</a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700']">Settings</a>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'tw-bg-gray-100' : '', 'tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700']">Sign out</a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:tw-hidden">
      <div class="tw-space-y-1 tw-pb-4 tw-pt-2">
        <!-- Current: "tw-bg-indigo-50 tw-border-indigo-500 tw-text-indigo-700", Default: "tw-border-transparent tw-text-gray-500 hover:tw-bg-gray-50 hover:tw-border-gray-300 hover:tw-text-gray-700" -->
        <DisclosureButton as="a" href="#" class="tw-block tw-border-l-4 tw-border-indigo-500 tw-bg-indigo-50 tw-py-2 tw-pl-3 tw-pr-4 tw-text-base tw-font-medium tw-text-indigo-700">
          Dashboard
        </DisclosureButton>
        <DisclosureButton
          as="a"
          href="#"
          class="tw-block tw-border-l-4 tw-border-transparent tw-py-2 tw-pl-3 tw-pr-4 tw-text-base tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-bg-gray-50 hover:tw-text-gray-700"
        >
          Team
        </DisclosureButton>
        <DisclosureButton
          as="a"
          href="#"
          class="tw-block tw-border-l-4 tw-border-transparent tw-py-2 tw-pl-3 tw-pr-4 tw-text-base tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-bg-gray-50 hover:tw-text-gray-700"
        >
          Projects
        </DisclosureButton>
        <DisclosureButton
          as="a"
          href="#"
          class="tw-block tw-border-l-4 tw-border-transparent tw-py-2 tw-pl-3 tw-pr-4 tw-text-base tw-font-medium tw-text-gray-500 hover:tw-border-gray-300 hover:tw-bg-gray-50 hover:tw-text-gray-700"
        >
          Calendar
        </DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/vue/24/outline";
</script>
