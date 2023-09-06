<template>
    <nav class="container-fluid bg-white z-40 px-1.5 py-0 sm:px-3">
        <div class="container-fluid mx-auto h-full w-full max-w-screen-xl px-0 sm:px-0 lg:px-8">
            <div class="relative flex h-full w-full justify-center">
                <div class="my-0 flex h-full w-full items-center justify-between sm:items-stretch sm:justify-start">
                    <div class="m-0 h-full w-full flex-shrink-0 items-center justify-between p-0">
                        <div class="m-0 h-full w-full flex-nowrap items-center justify-between">
                            <div class="flex items-center justify-between p-0 py-1 sm:hidden">
                                <div class="flex flex-row items-center justify-center gap-x-4">
                                    <BurgerMenu class="col-2 flex items-center justify-center" />
                                    <ButtonsDarkModeButton class="col-2 flex items-center justify-center" />
                                </div>
                                <NavTitle class="col-4 flex items-center justify-center" />
                                <div class="flex flex-row items-center justify-center gap-x-4">
                                    <ButtonsMicrophoneButton class="col-2 flex items-center justify-center" />
                                    <SearchBox @click="toggleSearchSection" :openSearchSection="openSearchSection" class="col-2 flex items-center justify-center" />
                                </div>
                            </div>
                            <div class="hidden sm:flex">
                                <DesktopNavBar class="m-0 hidden h-16 w-full justify-evenly py-2 sm:flex" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SearchBoxSection class="flex h-15 items-center justify-center" :openSearchSection="openSearchSection" />
        </div>
    </nav>
</template>

<script setup lang="ts">
import { onKeyUp } from "@vueuse/core";

const openSearchSection: Ref<boolean> = ref(false);
const openBurgerMenu: Ref<boolean> = ref(false);
const openProfileMenu: Ref<boolean> = ref(false);

// Custom escape-listener for the searchSeaction
onKeyUp("Escape", () => {
    if (openSearchSection.value) closeMenus();
});

const closeMenus = () => {
    openBurgerMenu.value = false;
    openProfileMenu.value = false;
    // openSearchSection.value = false;
};

const toggleSearchSection = () => {
    if (openSearchSection.value) {
        openSearchSection.value = false;
    } else {
        closeMenus();
        openSearchSection.value = true;
    }
};
</script>
