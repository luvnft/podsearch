<template>
  <div class="h-full">
    <HeadlessMenu as="div" class="inset-y-0 left-0 flex h-full w-full origin-top-left items-center sm:hidden" v-slot="{ open, close }">
      <HeadlessMenuButton
        class="text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
      >
        <span class="sr-only">Open main menu</span>
        <Bars3Icon v-if="!open" class="h-full w-full scale-90" aria-hidden="true" />
        <XMarkIcon v-else class="block h-full w-full scale-90" aria-hidden="true" />
      </HeadlessMenuButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <HeadlessMenuItems :class="['bg-white absolute left-0 top-12 z-40 w-40 origin-top-left rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5  focus:outline-none']" @click="close">
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink to="about" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">About</NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink to="contact" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">Contact</NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <a :href="donateLink" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">Donate</a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink to="developer" :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']">For developers</NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink :class="[active ? 'bg-gray-100' : '', 'text-gray-700 block px-4 py-2 text-sm no-underline ']" @click="toggleColorMode">{{ isDark ? "Dark" : "Light" }} mode</NuxtLink>
          </HeadlessMenuItem>
        </HeadlessMenuItems>
      </transition>
    </HeadlessMenu>
  </div>
</template>

<script setup lang="ts">
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
  console.log("Mode is: ", colorMode.value);
};
</script>
