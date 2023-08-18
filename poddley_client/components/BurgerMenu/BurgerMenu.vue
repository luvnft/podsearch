<template>
  <HeadlessMenu as="div" class="inset-y-0 left-0 flex h-12 w-12 origin-top-left items-center p-0 text-left" v-slot="{ open, close }">
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
      <HeadlessMenuItems class="bg-white ring-black absolute left-0 top-full z-10 m-0 w-56 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
        <div class="bg-white w-full rounded-xl px-0 py-1">
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <NuxtLink exact to="/" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900 font-bold ' : 'text-gray-700 fill-gray-500', ' flex justify-between gap-x-0 px-3 py-2 text-base']">
              Home
              <svg-icon name="home" class="text-gray-500 h-4 w-4 p-0 dark:group-hover:text-gray-700" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <NuxtLink exact to="about" :class="`${active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500'} text flex justify-between gap-x-0 px-3 py-2 text-base`">
              About
              <svg-icon name="info" class="h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <NuxtLink to="contact" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900 font-bold' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
              Contact
              <svg-icon name="contact" class="h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <a :href="donateLink" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900 font-bold' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
              Donate
              <svg-icon name="donate" class="h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </a>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>

<style scoped>
.router-link-exact-active {
  @apply border-l-2;
  @apply border-gray-700;
  @apply bg-neutral-100;
  @apply font-bold;
  @apply fill-gray-700 !important;
  @apply text-gray-700;

  @media (prefers-color-scheme: dark) {
    svg {
      @apply fill-neutral-200 !important;
    }
  }
  @media (prefers-color-scheme: light) {
    svg {
      @apply fill-gray-500 !important;
    }
  }
}
</style>
