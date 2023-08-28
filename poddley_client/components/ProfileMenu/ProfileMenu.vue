<template>
  <!-- <div class="h-full">
    <HeadlessMenu as="div" class="inset-y-0 right-0 flex h-full w-full origin-top-left items-center" v-slot="{ open, close }">
      <HeadlessMenuButton
        class="flex h-full w-full items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
      >
        <span class="sr-only">Open main menu</span>
        <UserCircleIcon v-if="!open" class="h-full w-full scale-90" aria-hidden="true" />
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
        <HeadlessMenuItems
          class="absolute right-0 top-12 z-40 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          @click="close"
        >
          <HeadlessMenuItem v-slot="{ active }">
            <NuxtLink to="login" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-base text-gray-700 no-underline']">Login/Signup</NuxtLink>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" v-if="user">
            <button @click="logout" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-base text-gray-700 no-underline']">Logout</button>
          </HeadlessMenuItem>
        </HeadlessMenuItems>
      </transition>
    </HeadlessMenu>
  </div> -->
</template>

<script setup lang="ts">
import { XMarkIcon, UserCircleIcon } from "@heroicons/vue/24/outline";

// const client = useSupabaseAuthClient();
// const user = useSupabaseUser();

// const logout = async () => {
//   await client.auth.signOut();
// };
</script>
