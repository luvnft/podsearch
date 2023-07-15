<template>
  <div class="tw-px-1.5 tw-py-0.5">
    <Disclosure as="nav" class="tw-z-40 tw-border-none tw-bg-white tw-pb-0 tw-pt-0 tw-shadow-none">
      <div class="tw-mx-auto tw-h-10 tw-max-w-7xl tw-px-0 sm:tw-px-6 lg:tw-px-8">
        <div class="tw-relative tw-flex tw-h-full tw-w-full tw-justify-between">
          <div class="tw-my-0 tw-flex tw-h-full tw-w-full tw-flex-1 tw-items-center tw-justify-between sm:tw-items-stretch sm:tw-justify-start">
            <div class="tw-flex tw-h-10 tw-w-full tw-flex-shrink-0 tw-items-center tw-justify-between">
              <BurgerMenu />
              <NavTitle />
              <SearchBox @click="toggleSearchSection" @keyup.space="toggleSearchSection" :showSearchSection="showSearchSection" />
            </div>
          </div>
        </div>
      </div>
      <SearchBoxSection v-if="showSearchSection" class="tw-flex tw-h-10 tw-items-center tw-justify-center tw-my-[1px]" />
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from "@headlessui/vue";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/vue/24/outline";
const showSearchSection: Ref<boolean> = ref(false);

const toggleSearchSection = () => (showSearchSection.value = !showSearchSection.value);

const openProfileMenu: Ref<boolean> = ref(false);
const profileClicked = ref(false);
const client = useSupabaseAuthClient();
const user = useSupabaseUser();

const changeProfileClicked = () => {
  profileClicked.value = !profileClicked.value;
};

const logout = async () => {
  await client.auth.signOut();
  navigateTo("/login");
};

const login = async () => {
  navigateTo("/login");
};

const toggleProfileMenu = () => {
  if (openProfileMenu.value) {
    openProfileMenu.value = false;
  } else {
    openProfileMenu.value = true;
  }
};
</script>
