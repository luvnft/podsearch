<template>
  <HeadlessMenu as="div" class="relative inline-block text-left">
    <div>
      <HeadlessMenuButton
        class="bg-gray-0 flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      >
        <span class="sr-only">Open options</span>
        <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
      </HeadlessMenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <HeadlessMenuItems
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="w-full py-1 bg-white rounded-xl">
          <HeadlessMenuItem v-slot="{ active }" class="flex flex-row flex-nowrap items-center no-underline">
            <a
              :href="props.searchEntry.link"
              :class="[active ? 'bg-gray-100 fill-gray-900 text-gray-900' : 'fill-gray-500 text-gray-700', 'flex gap-x-1 px-4 py-2 text-sm ']"
            >
              Go to podcast homepage
              <svg-icon name="link" class="h-5 w-4 p-0.5" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="flex flex-row flex-nowrap items-center no-underline">
            <a
              :href="props.searchEntry.url"
              :class="[active ? 'bg-gray-100 fill-gray-900 text-gray-900' : 'fill-gray-500 text-gray-700', 'flex gap-x-1 px-4 py-2 text-sm ']"
            >
              Podcast RSS-feed
              <svg-icon name="rss" class="h-5 w-4 p-0.5" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="flex flex-row flex-nowrap items-center no-underline">
            <button
              :href="props.searchEntry.id"
              :class="[active ? 'bg-gray-100 fill-gray-900 text-gray-900' : 'fill-gray-500 text-gray-700', 'flex w-full gap-x-1 px-4 py-2 text-sm ']"
              @click="copySegmentLink"
            >
              Copy link to segment
              <svg-icon name="copylink" class="h-5 w-4 p-0.5" />
            </button>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="flex w-full flex-row flex-nowrap items-center no-underline">
            <a
              :href="props.searchEntry.episodeLinkToEpisode"
              :class="[active ? 'bg-gray-100 fill-gray-900 text-gray-900' : 'fill-gray-500 text-gray-700', 'flex gap-x-1 px-4 py-2 text-sm ']"
            >
              Go to episode
              <svg-icon name="link" class="h-5 w-4 p-0.5" />
            </a>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </transition>
  </HeadlessMenu>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { Hit } from "../../types/SearchResponse";
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
