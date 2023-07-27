<template>
  <HeadlessMenu as="div" class="tw-relative tw-inline-block tw-text-left">
    <div>
      <HeadlessMenuButton
        class="tw-bg-gray-0 tw-flex tw-items-center tw-rounded-full tw-text-gray-400 hover:tw-text-gray-600 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500 focus:tw-ring-offset-2 focus:tw-ring-offset-gray-100"
      >
        <span class="tw-sr-only">Open options</span>
        <EllipsisVerticalIcon class="tw-h-5 tw-w-5" aria-hidden="true" />
      </HeadlessMenuButton>
    </div>

    <transition
      enter-active-class="tw-transition tw-ease-out tw-duration-100"
      enter-from-class="tw-transform tw-opacity-0 tw-scale-95"
      enter-to-class="tw-transform tw-opacity-100 tw-scale-100"
      leave-active-class="tw-transition tw-ease-in tw-duration-75"
      leave-from-class="tw-transform tw-opacity-100 tw-scale-100"
      leave-to-class="tw-transform tw-opacity-0 tw-scale-95"
    >
      <HeadlessMenuItems
        class="tw-absolute tw-right-0 tw-z-10 tw-mt-2 tw-w-56 tw-origin-top-right tw-rounded-md tw-bg-white tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none"
      >
        <div class="tw-w-full tw-py-1">
          <HeadlessMenuItem v-slot="{ active }" class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-no-underline">
            <a
              :href="props.searchEntry.link"
              :class="[active ? 'tw-bg-gray-100 tw-fill-gray-900 tw-text-gray-900' : 'tw-fill-gray-500 tw-text-gray-700', 'tw-flex tw-gap-x-1 tw-px-4 tw-py-2 tw-text-sm']"
            >
              Go to podcast homepage
              <svg-icon name="link" class="tw-h-5 tw-w-4 tw-p-0.5" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-no-underline">
            <a
              :href="props.searchEntry.url"
              :class="[active ? 'tw-bg-gray-100 tw-fill-gray-900 tw-text-gray-900' : 'tw-fill-gray-500 tw-text-gray-700', 'tw-flex tw-gap-x-1 tw-px-4 tw-py-2 tw-text-sm']"
            >
              Podcast RSS-feed
              <svg-icon name="rss" class="tw-h-5 tw-w-4 tw-p-0.5" />
            </a>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-no-underline">
            <button
              :href="props.searchEntry.id"
              :class="[active ? 'tw-bg-gray-100 tw-fill-gray-900 tw-text-gray-900' : 'tw-fill-gray-500 tw-text-gray-700', 'tw-flex tw-w-full tw-gap-x-1 tw-px-4 tw-py-2 tw-text-sm']"
              @click="copySegmentLink"
            >
              Copy link to segment
              <svg-icon name="copylink" class="tw-h-5 tw-w-4 tw-p-0.5" />
            </button>
          </HeadlessMenuItem>
          <HeadlessMenuItem v-slot="{ active }" class="tw-flex tw-w-full tw-flex-row tw-flex-nowrap tw-items-center tw-no-underline">
            <a
              :href="props.searchEntry.episodeLinkToEpisode"
              :class="[active ? 'tw-bg-gray-100 tw-fill-gray-900 tw-text-gray-900' : 'tw-fill-gray-500 tw-text-gray-700', 'tw-flex tw-gap-x-1 tw-px-4 tw-py-2 tw-text-sm']"
            >
              Go to episode
              <svg-icon name="link" class="tw-h-5 tw-w-4 tw-p-0.5" />
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
