<template>
  <HeadlessMenu as="div" class="absolute z-50 flex h-9 w-9 items-center justify-center text-left">
    <div class="h-9 w-9">
      <HeadlessMenuButton class="bg-gray-0 group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex h-9 w-9 items-center justify-center rounded-lg border fill-neutral-400 p-0 font-medium no-underline shadow-sm hover:bg-neutral-100 focus:ring-gray-100 focus:ring-offset-gray-100 dark:ring-neutral-500 focus:outline-none focus:ring-2 active:shadow-sm">
        <EllipsisVerticalIcon class="h-6 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" aria-hidden="true" />
      </HeadlessMenuButton>
    </div>

    <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
      <HeadlessMenuItems class="bg-white ring-black absolute right-0 top-full z-50 mt-2 w-56 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
        <div class="bg-white w-full rounded-lg px-0 py-1">
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center no-underline">
            <a :href="props.searchEntry.link" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base  ']">
              Podcast homepage
              <svg-icon name="podcastduotone" class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
            <a :href="props.searchEntry.url" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base  ']">
              Podcast RSS-feed
              <svg-icon name="rss" class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
            <button :href="props.searchEntry.id" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base  ']" @click="copySegmentLink">
              Copy link to segment
              <svg-icon name="copylink" class="mr-[3px] h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </button>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
            <a :href="props.searchEntry.episodeLinkToEpisode" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base  ']">
              Go to episode
              <svg-icon name="link" class="mr-[3px] h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
            <a :href="props.searchEntry.episodeLinkToEpisode" :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base  ']">
              Load entire transcript
              <svg-icon name="quote" class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
            </a>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { Hit } from "../../../types/SearchResponse";
import { SearchQuery } from "types/SearchQuery";
import { Utils } from "composables/useUtils";
const utils: Utils = useUtils();
const props = defineProps<{
  searchEntry: Hit;
}>();

const copySegmentLink = () => {
  const rootPage: string = useRuntimeConfig().public.HOMEPAGE;
  const segmentId: string = props.searchEntry.id;
  const filter: string = `id='${segmentId}'`;
  const constructedSearchQuery: SearchQuery = {
    filter: filter,
  };
  // Save url to user copy/paste
  const encodedUrl: string = utils.encodeQuery(constructedSearchQuery) || "";
  const finalUrl: string = rootPage + "?searchQuery=" + encodedUrl;
  navigator.clipboard.writeText(finalUrl);
};
</script>
