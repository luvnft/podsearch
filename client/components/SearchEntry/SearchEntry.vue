<template>
    <div
        class="dark:bg-neutral-0 row mx-0 flex h-full flex-col items-start justify-start rounded-lg p-0 shadow-none dark:border-none dark:shadow-none md:gap-y-0">
        <div
            class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-col items-center justify-between rounded-lg px-0 py-0 pb-0 leading-normal sm:px-2">
            <div class="border-1 h-full min-w-full rounded-lg shadow-lg dark:border-neutral-100">
                <div v-if="props.searchEntry.youtubeVideoLink">
                    <LiteYoutubeEmbed @click="handleYoutubeClick"
                        :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)"
                        :startTime="computedStartTime" width="100%" height="auto"
                        :videoTitle="props.searchEntry.episodeTitle" :autoplay="false" :allowFullscreen="true"
                        :pictureInPicture="true" :noCookie="true" posterQuality="sddefault"
                        :searchEntry="props.searchEntry" />
                </div>
                <div v-else class="aspect-video rounded-lg bg-cover bg-top bg-no-repeat"
                    :style="`background: url(${utils.prepareImageLink(props.searchEntry.podcastImage, 500)});`">
                    <ImageWrapper class="h-full w-full rounded-lg bg-top object-contain backdrop-blur"
                        :imageUrl="props.searchEntry.podcastImage"
                        :alt="`Description of Image of ${props.searchEntry.episodeTitle}`" :width="400" />
                </div>
            </div>
        </div>
        <div
            class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-grow flex-col items-center justify-between px-0 pt-1">
            <div class="row flex-grow-1 flex h-full w-full flex-row justify-start">
                <div class="flex h-full flex-col items-start justify-center gap-y-0 px-0 py-0">
                    <div
                        class="bg-neutral-100 border-neutral-300 mb-0 line-clamp-2 flex h-full w-full flex-col flex-nowrap items-start justify-start gap-y-0 text-ellipsis rounded-lg border px-1.5 py-1.5 shadow-sm">
                        <div class="flex h-auto w-full flex-row items-center justify-between py-0 pb-0 pl-1">
                            <p
                                class="multiline-ellipsis text-gray-800 mb-0 block w-full items-center justify-center px-0 py-0 text-start font-bold tracking-tighter">
                                {{ props.searchEntry.episodeTitle }}
                            </p>
                            <div class="w-18 float-right flex h-full items-start justify-start gap-x-[1.5px] pl-1 mr-0">
                                <div class="block h-9 w-9 items-start justify-end">
                                    <ButtonsPlayButton class="absolute h-9 w-9" :searchEntry="props.searchEntry"
                                        @click="handlePlaying" :playing="playing" />
                                </div>
                                <div class="block h-9 w-9 items-start justify-end">
                                    <ButtonsSubtitlesButton @subSyncTrigger="(value: boolean) => {
                                        subtitlesActivated = !subtitlesActivated;
                                    }" class="absolute h-9 w-9" :searchEntry="props.searchEntry" :index="index"
                                        :loadingFullTranscript="loadingFullTranscript" :activated="subtitlesActivated" />
                                </div>
                                <div class="block h-9 w-9 items-start justify-end">
                                    <ButtonsMoreButton
                                        @gettingFullTranscript="(value: boolean) => loadingFullTranscript = value"
                                        class="absolute h-9 w-9" :searchEntry="props.searchEntry" :index="index"
                                        :loadingFullTranscript="loadingFullTranscript" />
                                </div>
                            </div>
                        </div>
                        <div class="flex w-full justify-start h-44 flex-grow">

                            <div v-if="!loadingFullTranscript"
                                :class="`${subtitlesActivated ? '' : ''} dark:scrollbar-track-gray-800 text-gray-800 ml-0 mr-0 flex-grow w-full overflow-y-auto overflow-x-hidden pb-0 text-sm sm:text-base scrollbar-track-gray-100`">
                                <SearchEntryHit @goToAudioTime="goToAudioTime" :searchEntry="props.searchEntry"
                                    :currentPlayingTime="currentPlayingTime" :subtitlesActivated="subtitlesActivated" />
                            </div>
                            <div class="w-full flex h-44 items-center justify-center" v-if="loadingFullTranscript">
                                <IconsSpinnerIcon />
                            </div>
                        </div>
                        <div v-if="playing"
                            :class="`m-0 flex w-full flex-col flex-nowrap items-center justify-center border-none p-0 py-0 pb-0 pt-1 ${isFirefox && 'hue-rotate-[180deg]'}`">
                            <audio ref="audioPlayer" :currentTime="unmodifiableStartValue" controls preload="auto" autoplay
                                :class="`border filter focus:outline-2 focus:outline-gray-900 ring-0 focus:border-gray-500 text-black h-9 w-full rounded-lg  ${isIos ? '-mb-1 border-none' : 'border-neutral-200 rounded-lg shadow-sm'} dark:border-none dark:shadow-none ${!isFirefox && !isIos ? 'dark:bg-[#f2f4f5] dark:hue-rotate-[200deg] dark:invert-[0.85] dark:saturate-[10] border' : ''} ${isFirefox && 'dark:sepia filter dark:invert-[0.1] invert dark:hue-rotate-[300deg] border border-gray-800 grayscale'}`"
                                type="audio/mpeg" :title="props.searchEntry.episodeTitle"
                                :src="props.searchEntry.episodeEnclosure" @timeupdate="handleTimeChange" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import TranscriptionService from "../../utils/services/TranscriptionsService";
import { ClientSearchResponseHit, ClientSearchResponse, ClientSegmentHit } from "../../types/ClientSearchResponse";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";

const utils: Utils = useUtils();
const searchStore = useSearchStore();
const { searchResults } = storeToRefs(searchStore);
const transcriptionService: TranscriptionService = new TranscriptionService();

let hasSearched: boolean = false;
const props = defineProps<{
    searchEntry: ClientSearchResponseHit;
    index: number;
}>();
const { isFirefox, isSafari, isIos, } = useDevice();
const playing: Ref<boolean> = ref(false);
const audioPlayer: Ref<HTMLAudioElement | null> = ref(null);
const subtitlesActivated: Ref<boolean> = ref(true);
const loadingFullTranscript: Ref<boolean> = ref(false);
const handlePlaying = () => {

    playing.value = !playing.value;
};
const currentPlayingTime: Ref<number> = ref(props.searchEntry.subHits[0].start);

const unmodifiableStartValue: number = currentPlayingTime.value;

const goToAudioTime = (moveToTime: number) => {

    if (audioPlayer.value) {
        audioPlayer.value.currentTime = moveToTime;
    }
}

const handleTimeChange = async (event: Event) => {
    try {
        // Assuming event is of type Event, we need to cast it to any 
        // to access the non-standard properties like target.currentTime
        const currentSeconds: number = parseFloat((event as any).target.currentTime.toFixed(1));

        // Assuming currentPlayingTime and searchResults are reactive references
        currentPlayingTime.value = currentSeconds;

        const hits = searchResults.value.hits[props.index];
        const lastAvailableElementIndex: number = hits.subHits.length - 1;
        const lastAvailableElement: ClientSegmentHit = hits.subHits[lastAvailableElementIndex];

        if ((currentSeconds / lastAvailableElement.start) > 0.96) {
            // Assuming audioPlayer is a reactive reference
            if (hasSearched) return;
            if (lastAvailableElementIndex + 1 !== audioPlayer.value?.duration) {
                hasSearched = true;


                // Get entire transcript for that particular episode...
                const searchResponse: ClientSearchResponse = await transcriptionService.search({
                    filter: `belongsToEpisodeGuid='${props.searchEntry.episodeGuid}'`,
                    getFullTranscript: true,
                    sort: ["start:asc"],
                    searchString: ""
                });


                // // Since the received response hit has the type hit and not segmentHit, we gotta convert it to segmentHit first, reason for this is more or less just what is needed where, 
                // // Maybe casting is better, but dunno
                // let segmentHits: ClientSegmentHit[] = searchResponse.hits.map((hit: ClientSegmentHit) => {
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

                const segmentHits = fragmentSegmentHits(searchResponse.hits[0].subHits)
                searchResults.value.hits[props.index].subHits = segmentHits;
            }

        }
    } catch (error) {
        console.error("Error in handleTimeChange: ", error);
        hasSearched = false;
    }
};

const computedStartTime = computed(() => {
    const start = parseFloat(props.searchEntry.subHits[0].toString()) || 0;
    const deviationTime = parseFloat((props.searchEntry.deviationTime || 0).toString()) || 0;
    const val = start - deviationTime;
    return val < 0 ? 0 : val;
});

const handleYoutubeClick = (event: any) => {

}

</script>

<style scoped>
:deep(.highlight) {
    @apply text-red-500;
}

.loader {
    display: inline;
}

.loader span {
    opacity: 0;
    animation: blink 1s infinite;
}

.loader span:after {
    content: "›";
    @apply text-gray-500;
}

.loader span:nth-child(1) {
    animation-delay: 0s;
}

.loader span:nth-child(2) {
    animation-delay: 0.1s;
}

.loader span:nth-child(3) {
    animation-delay: 0.2s;
}

@keyframes blink {

    50%,
    100% {
        opacity: 1;
    }

    0%,
    49% {
        opacity: 0;
    }
}

.segment {
    padding-right: 7px;
    padding-top: 7px;
    padding-bottom: 7px;
    padding-left: 7px;
    box-shadow: 0 0px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.4);
    -webkit-box-pack: end !important;
}

.image-aspect-ratio {
    background-size: cover;
    background-position: center;
    width: 100%;
    padding-top: 56.25%;
    /* 16:9 Aspect Ratio */
    position: relative;
    box-shadow: 0 0 1px #5e5e5e, 0 0 1px #383838, 0 0 2px #141414;
}

.multiline-ellipsis {
    overflow: hidden !important;
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2;
    white-space: pre-wrap !important;
}

@media (prefers-color-scheme: dark) {
    /* audio {
    filter: hue-rotate(180deg) saturate(20) invert(0.85);
    @apply bg-[#f6feff];
    @apply border-gray-100;
  } */
}

@keyframes moveRainbow {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}

.rainbow-border {
    @apply p-[1px] !important;
    @apply rounded-lg !important;

    background-size: 200% auto;
    background-image: linear-gradient(to right,
            violet,
            indigo,
            blue,
            green,
            yellow,
            orange,
            red,
            violet);
    animation: moveRainbow 5s linear infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.inner-content {
    padding: 5px;
    display: flex;
    align-items: center;
    width: 80px;
    /* Adjust accordingly */
    background-color: white;
    /* Or another color / gradient */
    border-radius: 50%;
    position: relative;
    z-index: 2;
}
</style>
