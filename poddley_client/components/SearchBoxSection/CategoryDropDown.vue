<template>
  <div>
    <HeadlessMenu as="div" class="z-50 flex w-auto items-center justify-center text-left" v-slot="{ open, close }">
      <HeadlessMenuButton :as="GenericButton" class="flex justify-center rounded-none text-gray-700 bg-gray-200 border-gray-300 z-0 ml-0 h-12 w-full flex-shrink-0 items-center gap-x-1 rounded-l-md border-r py-0 px-2.5 text-center text-sm font-medium outline-none hover:bg-gray-200 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset">
        <div class="flex h-12 w-[21px] items-center justify-center">
          <svg-icon v-if="props.chosenCategory.key === 'quote'" name="quote" class="-mr-0.5 h-12 w-full p-0 group-hover:fill-gray-900 dark:group-hover:fill-gray-300" />
          <svg-icon v-if="props.chosenCategory.key === 'episode'" name="episode" class="-mr-0.5 h-12 w-full p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
          <svg-icon v-if="props.chosenCategory.key === 'podcast'" name="podcastduotone" class="-mr-0.5 h-12 w-full p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
        </div>
      </HeadlessMenuButton>

      <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <HeadlessMenuItems @click="close" class="bg-white ring-black absolute left-0 top-full z-20 m-0 mt-1 w-56 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
          <div class="bg-white w-full rounded-lg px-0 py-1">
            <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-start no-underline">
              <button name="podcast" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="podcastduotone" class="-ml-0.5 -mr-1 h-5 w-5 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Podcast
              </button>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-start no-underline">
              <button name="episode" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="episode" class="-mr-0.5 h-[17px] w-[17px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Episode
              </button>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" class="`group no-underline` flex w-full flex-row flex-nowrap items-center justify-start">
              <button name="quote" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="quote" class="-mr-0.5 h-[19px] w-[19px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Quotes
              </button>
            </HeadlessMenuItem>
          </div>
        </HeadlessMenuItems>
      </transition>
    </HeadlessMenu>
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from "../../store/searchStore";
import GenericButton from "../Buttons/GenericButton/GenericButton.vue";
const props = defineProps<{
  chosenCategory: {
    key: string;
    name: string;
  };
  handleCategoryChange: (event: any) => void;
}>();
</script>

<style scoped>
.category {
  text-transform: capitalize;
}

.router-link-exact-active {
  @apply bg-gray-200;
}
</style>
