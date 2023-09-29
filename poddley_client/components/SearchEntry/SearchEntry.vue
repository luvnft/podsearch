<template>
  <div class="dark:bg-neutral-0 row mx-0 flex h-full flex-col items-start justify-start rounded-lg p-0 shadow-none dark:border-none dark:shadow-none md:gap-y-0">
    <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-col items-center justify-between rounded-lg px-0 py-0 pb-0 leading-normal sm:px-2">
      <div class="border-1 h-full min-w-full rounded-lg shadow-lg dark:border-neutral-100">
        <div v-if="props.searchEntry.youtubeVideoLink">
          <LiteYoutubeEmbed :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)" :startTime="computedStartTime" width="100%" height="auto" :videoTitle="props.searchEntry.episodeTitle" :autoplay="false" :allowFullscreen="true" :pictureInPicture="true" :noCookie="true" posterQuality="hqdefault" :searchEntry="props.searchEntry" />
        </div>
        <div v-else class="aspect-video rounded-lg bg-cover bg-top bg-no-repeat" :style="`background: url(${props.searchEntry.imageUrl});`">
          <img loading="lazy" class="h-full w-full rounded-lg bg-top object-contain backdrop-blur" :src="props.searchEntry.imageUrl" alt="Description of Image" />
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-grow flex-col items-center justify-between px-0 pt-1">
      <div class="row flex-grow-1 flex h-full w-full flex-row justify-start">
        <div class="flex h-full flex-col items-start justify-center gap-y-0 px-0 py-0">
          <div class="bg-neutral-100 border-neutral-300 mb-0 line-clamp-2 flex h-full w-full flex-col flex-nowrap items-start justify-start gap-y-0 text-ellipsis rounded-lg border px-2.5 py-1.5 shadow-sm">
            <div class="z-50 flex h-auto w-full flex-row items-center justify-between py-0 pb-1">
              <p class="multiline-ellipsis text-gray-800 mb-0 block w-full items-center justify-center px-0 py-0 text-start font-bold tracking-tighter">
                {{ props.searchEntry.episodeTitle }}
              </p>
              <div class="w-18 float-right -mr-1 flex h-full items-start justify-start gap-x-0 pl-1 pr-0">
                <div class="flex h-10 w-10 items-start justify-end">
                  <ButtonsPlayButton class="h-10 w-10" :searchEntry="props.searchEntry" @click="handlePlaying" :playing="playing" />
                </div>
                <div class="flex h-10 w-10 items-start justify-end">
                  <ButtonsMoreButton class="absolute h-10 w-10" :searchEntry="props.searchEntry" />
                </div>
              </div>
            </div>
            <div class="flex w-full justify-start">
              <div class="mb-0 mt-0 flex h-full max-h-full min-h-full justify-center rounded-lg px-0 py-0 pb-0 text-start" :key="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()">
                <div :class="`${subtitlesActivated ? 'animate__animated animate__flipInX animate__faster' : ''} text-gray-800 ml-0 mr-0 h-[100px] w-full overflow-y-auto overflow-x-hidden pb-0 md:h-32 `" v-html="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()"></div>
              </div>
            </div>

            <div v-if="playing" :class="`m-0 flex w-full flex-col flex-nowrap items-center justify-center rounded-lg border border-none p-0 py-0 pb-1 `">
              <audio :currentTime="props.searchEntry.start" controls preload="auto" autoplay :key="props.searchEntry.start" :class="`text-black h-10 w-full rounded-lg border ${isIos ? '' : 'border-neutral-200 rounded-lg border shadow-sm'}  dark:border-none dark:shadow-none ${!isSafari && !isFirefox ? 'dark:bg-[#f2f4f5] dark:hue-rotate-[200deg] dark:invert-[0.85] dark:saturate-[10] dark:filter' : ''}`" type="audio/mpeg" :title="props.searchEntry.episodeTitle" :src="props.searchEntry.episodeEnclosure" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Hit, SearchResponse } from "../../types/SearchResponse";
import TranscriptionService from "../../utils/services/TranscriptionsService";
import { SearchQuery } from "types/SearchQuery";

const props = defineProps<{
  searchEntry: Hit;
}>();
const { isFirefox, isSafari, isIos } = useDevice();
const playing: Ref<boolean> = ref(false);
const subtitlesActivated: Ref<boolean> = ref(false);
const transcriptionService: TranscriptionService = new TranscriptionService();
const currentPlayingSegment: Ref<Hit> = ref(props.searchEntry);

const handlePlaying = () => {
  playing.value = !playing.value;
};

const computedStartTime = computed(() => {
  const start = parseFloat(props.searchEntry.start.toString()) || 0;
  const deviationTime = parseFloat((props.searchEntry.deviationTime || 0).toString()) || 0;
  const val = start - deviationTime;
  return val < 0 ? 0 : val;
});

async function search(searchQuery: SearchQuery) {
  const searchResponse: SearchResponse = await transcriptionService.search(searchQuery);
  return searchResponse;
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
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
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
</style>
