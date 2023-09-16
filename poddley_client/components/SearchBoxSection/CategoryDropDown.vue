<template>
  <div>
    <HeadlessMenu as="div" class="max-w-[120px] z-50 flex w-[120px] items-center justify-center text-left">
      <HeadlessMenuButton class="text-gray-700 bg-gray-100 border-gray-300 z-0 ml-0 inline-flex h-12 w-full flex-shrink-0 items-center justify-between rounded-l-md border-r px-2.5 py-0 text-center text-sm font-medium outline-none hover:bg-gray-200 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset">
        <svg-icon v-if="chosenCategory === 'quote'" name="transcript" class="-mr-0.5 h-5 w-5 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
        <svg-icon v-if="chosenCategory === 'episode'" name="episode" class="-mr-0.5 h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
        <svg-icon v-if="chosenCategory === 'podcast'" name="podcastduotone" class="-mr-0.5 h-5 w-5 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
        <p class="category ml-1.5">
          {{ chosenCategory }}
        </p>
        <svg class="ml-2.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
        </svg>
      </HeadlessMenuButton>

      <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <HeadlessMenuItems class="bg-white ring-black absolute left-0 top-full z-50 mt-2 w-48 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
          <div class="bg-white w-full rounded-lg px-0 py-1">
            <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-start no-underline">
              <button name="podcast" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="podcastduotone" class="-mr-0.5 h-5 w-5 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Podcast
              </button>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-start no-underline">
              <button name="episode" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="episode" class="-mr-0.5 h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Episode
              </button>
            </HeadlessMenuItem>
            <HeadlessMenuItem v-slot="{ active }" class="`group no-underline` flex w-full flex-row flex-nowrap items-center justify-start">
              <button name="quote" @click="handleCategoryChange" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-start gap-x-3 px-3 py-2 text-left text-base']">
                <svg-icon name="transcript" class="-mr-0.5 h-5 w-5 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                Quote
              </button>
            </HeadlessMenuItem>
          </div>
        </HeadlessMenuItems>
      </transition>
    </HeadlessMenu>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { SearchQuery } from "#build/types/SearchQuery";
const chosenCategory: Ref<string> = ref("quote");
const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);

const handleCategoryChange = (event: any) => {
  console.log(event.target.name);
  chosenCategory.value = event?.target?.name || "";
};
</script>

<style scoped>
.category {
  text-transform: capitalize;
}

.router-link-exact-active {
  @apply bg-gray-200;
}
</style>
