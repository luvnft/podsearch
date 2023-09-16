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
      <HeadlessMenuItems @click="close" class="bg-white ring-black absolute left-0 top-full z-10 m-0 w-56 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
        <div class="text-gray-700 bg-white w-full rounded-lg px-0 py-1">
          <HeadlessMenuItem class="group flex w-full flex-row flex-nowrap items-center no-underline hover:bg-gray-300">
            <NuxtLink exact to="/" :class="`flex justify-between gap-x-0 px-3 py-2 text-base`">
              Home
              <svg-icon name="home" class="h-4 w-4 fill-gray-300 p-0 group-hover:fill-gray-700 dark:fill-gray-600 dark:group-hover:fill-gray-300" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <NuxtLink exact to="/about" :class="`group flex justify-between gap-x-0 px-3 py-2 text-base`">
              About
              <svg-icon name="info" class="h-4 w-4 fill-gray-300 p-0 group-hover:fill-gray-700 dark:fill-gray-600 dark:group-hover:fill-gray-300" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <NuxtLink exact to="/contact" :class="`group flex justify-between gap-x-0 px-3 py-2 text-base`">
              Contact
              <svg-icon name="contact" class="h-4 w-4 fill-gray-300 p-0 group-hover:fill-gray-700 dark:fill-gray-600 dark:group-hover:fill-gray-300" />
            </NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <a :href="donateLink" :class="`group flex justify-between gap-x-0 px-3 py-2 text-base`">
              Donate
              <svg-icon name="donate" class="h-4 w-4 fill-gray-300 p-0 group-hover:fill-gray-700 dark:fill-gray-600 dark:group-hover:fill-gray-300" />
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
@media (prefers-color-scheme: dark) {
  .router-link-exact-active {
    @apply border-l-2;
    @apply border-gray-700;
    @apply bg-neutral-100;
    @apply text-gray-700;
  }
  .router-link-exact-active svg {
    @apply dark:fill-gray-300 !important;
  }
}

.router-link-exact-active {
  @apply border-l-2;
  @apply border-gray-700;
  @apply bg-neutral-100;
  @apply text-gray-700;
}

.router-link-exact-active svg {
  @apply fill-gray-700 !important;
}
</style>
