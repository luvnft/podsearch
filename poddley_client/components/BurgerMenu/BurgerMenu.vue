<template>
  <HeadlessMenu as="div" class="inset-y-0 left-0 flex h-12 w-12 origin-top-left items-center text-left p-0" v-slot="{ open, close }">
    <HeadlessMenuButton
      class="hover:bg-gray-transparent text-gray-400 flex h-full items-center justify-center rounded-md p-2 hover:text-gray-500 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset"
    >
      <Bars3Icon v-if="!open" class="h-full w-full scale-95" aria-hidden="true" />
      <XMarkIcon v-else class="block h-full w-full scale-95" aria-hidden="true" />
    </HeadlessMenuButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <HeadlessMenuItems :class="['bg-white ring-black absolute left-0 top-12 z-40 w-40 origin-top-left rounded-md py-1 shadow-lg ring-1 ring-opacity-5  focus:outline-none']" @click="close">
        <HeadlessMenuItem v-slot="{ active }">
          <NuxtLink to="/" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">Home</NuxtLink>
        </HeadlessMenuItem>
        <HeadlessMenuItem v-slot="{ active }">
          <NuxtLink to="about" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">About</NuxtLink>
        </HeadlessMenuItem>
        <HeadlessMenuItem v-slot="{ active }">
          <NuxtLink to="contact" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">Contact</NuxtLink>
        </HeadlessMenuItem>
        <HeadlessMenuItem v-slot="{ active }">
          <a :href="donateLink" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">Donate</a>
        </HeadlessMenuItem>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>
