<template>
    <HeadlessMenu as="div" class="z-50 flex h-9 w-9 items-start justify-center text-left p-0">
        <Float placement="bottom-start" flip>
            <div class="flex h-9 w-9 items-start justify-center  ml-0">
                <HeadlessMenuButton :as="GenericButton"
                    class="bg-gray-0 group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex h-9 w-9 items-center justify-center rounded-lg border fill-neutral-400 p-0 font-medium no-underline shadow-sm hover:bg-neutral-100 focus:ring-gray-100 focus:ring-offset-gray-100 dark:ring-neutral-500 focus:outline-none focus:ring-2 active:shadow-sm">
                    <EllipsisVerticalIcon class="h-[23px] group-hover:fill-gray-500 dark:group-hover:fill-gray-300"
                        aria-hidden="true" />
                </HeadlessMenuButton>
            </div>

            <transition enter-active-class="transition duration-75 ease-out" enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                <HeadlessMenuItems :offset="4"
                    class="bg-white ring-black z-50 w-56 rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none">
                    <div class="bg-white w-full rounded-lg px-0 py-1">
                        <HeadlessMenuItem v-slot="{ active }"
                            class="group flex w-full flex-row flex-nowrap items-center no-underline">
                            <a :href="props.searchEntry.link"
                                :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
                                Podcast homepage
                                <svg-icon name="podcastduotone"
                                    class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                            </a>
                        </HeadlessMenuItem>
                        <HeadlessMenuItem v-slot="{ active }"
                            class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
                            <a :href="props.searchEntry.url"
                                :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
                                Podcast RSS-feed
                                <svg-icon name="rss"
                                    class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                            </a>
                        </HeadlessMenuItem>
                        <HeadlessMenuItem v-slot="{ active }"
                            class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
                            <button :href="props.searchEntry.subHits[0].id"
                                :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']"
                                @click="copySegmentLink">
                                Copy link to segment
                                <svg-icon name="copylink"
                                    class="mr-[3px] h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                            </button>
                        </HeadlessMenuItem>
                        <HeadlessMenuItem v-slot="{ active }"
                            class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
                            <a :href="props.searchEntry.episodeLinkToEpisode"
                                :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
                                Go to episode
                                <svg-icon name="link"
                                    class="mr-[3px] h-4 w-4 p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                            </a>
                        </HeadlessMenuItem>
                        <HeadlessMenuItem v-slot="{ active }"
                            class="group flex w-full flex-row flex-nowrap items-center justify-between no-underline">
                            <button @click="loadEntireTranscript(props.searchEntry.episodeGuid)"
                                :class="[active ? 'text-gray-900 bg-gray-100 fill-gray-900' : 'text-gray-700 fill-gray-500', 'flex justify-between gap-x-0 px-3 py-2 text-base']">
                                Load entire transcript
                                <svg-icon name="quote"
                                    class="mr-[3px] h-[18px] w-[18px] p-0 group-hover:fill-gray-500 dark:group-hover:fill-gray-300" />
                            </button>
                        </HeadlessMenuItem>
                    </div>
                </HeadlessMenuItems>
            </transition>
        </Float>
    </HeadlessMenu>
</template>

<script setup lang="ts">
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import { ClientSegmentHit, ClientSearchResponse, ClientSearchResponseHit } from "../../../types/ClientSearchResponse";
import { SearchQuery } from "types/SearchQuery";
import GenericButton from "../../../components/Buttons/GenericButton/GenericButton.vue";
import TranscriptionService from "../../../utils/services/TranscriptionsService";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../../store/searchStore";
import { Float } from '@headlessui-float/vue'

// Inside your component
const searchStore = useSearchStore();
const { searchResults } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();
const showVal: Ref<any> = ref(false);
const utils: Utils = useUtils();
const props = defineProps<{
    searchEntry: ClientSearchResponseHit;
    index: number;
    loadingFullTranscript: boolean;
}>();

const emit = defineEmits<{
    (e: "gettingFullTranscript", gettingFullTranscript: boolean): void;
}>();

const loadEntireTranscript = async (episodeGuid: string) => {
    emit("gettingFullTranscript", true);
    // Get entire transcript for that particular episode...
    const searchResponse: ClientSearchResponse = await transcriptionService.search({
        filter: `belongsToEpisodeGuid='${props.searchEntry.episodeGuid}'`,
        getFullTranscript: true,
        sort: ["start:asc"],
        searchString: ""
    });
    console.log("Transcript: ", searchResponse);

    // Since the received response hit has the type hit and not segmentHit, we gotta convert it to segmentHit first, reason for this is more or less just what is needed where, 
    // Maybe casting is better, but dunno
    // let segmentHits: ClientSegmentHit[] = searchResponse.hits.map((hit: ClientSearchResponseHit) => {
    //     return {
    //         text: hit.text,
    //         id: hit.id,
    //         start: hit.start,
    //         end: hit.end,
    //         language: hit.podcastLanguage,
    //         belongsToPodcastGuid: hit.podcastGuid,
    //         belongsToEpisodeGuid: hit.episodeGuid,
    //         belongsToTranscriptId: hit.belongsToTranscriptId,
    //     }
    // })

    // We loop over all the hits and create new segmentHits for the ones which have words bigger than some 5, essentially this
    console.log("Index is: ", props.index)
    const segmentHits = fragmentSegmentHits(searchResponse.hits[0].subHits)
    searchResults.value.hits[props.index].subHits = segmentHits;
    console.log("SearchResults NOOOOOOW: ", searchResults.value)
    console.log("Fragmentation done, should be set");

    emit("gettingFullTranscript", false);
};

const copySegmentLink = () => {
    const rootPage: string = useRuntimeConfig().public.HOMEPAGE;
    const segmentId: string = props.searchEntry.subHits[0].id;
    const filter: string = `id='${segmentId}'`;
    const constructedSearchQuery: SearchQuery = {
        filter: filter,
        searchString: null
    };
    // Save url to user copy/paste
    const encodedUrl: string = utils.encodeQuery(constructedSearchQuery) || "";
    const finalUrl: string = rootPage + "?searchQuery=" + encodedUrl;
    navigator.clipboard.writeText(finalUrl);
};
</script>
