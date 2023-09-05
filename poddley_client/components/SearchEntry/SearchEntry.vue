<template>
  <div class="dark:bg-neutral-0 row mx-0 flex h-full flex-col items-start justify-start rounded-lg p-0 shadow-none dark:border-none dark:shadow-none md:gap-y-0">
    <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-col items-center justify-between rounded-lg px-0 py-0 pb-0 leading-normal sm:px-2">
      <div class="border-1 h-full min-w-full rounded-lg shadow-lg dark:border-neutral-100">
        <div v-if="props.searchEntry.youtubeVideoLink">
          <LiteYoutubeEmbed :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)" :startTime="computedStartTime" width="100%" height="auto" :videoTitle="props.searchEntry.episodeTitle" :autoplay="false" :allowFullscreen="true" :pictureInPicture="true" :noCookie="true" posterQuality="hqdefault" :searchEntry="props.searchEntry" />
        </div>
        <div v-else class="aspect-video rounded-lg bg-cover bg-top bg-no-repeat" :style="`background: url(${props.searchEntry.imageUrl});`">
          <img loading="lazy" class="h-full w-full rounded-none bg-top object-contain backdrop-blur sm:rounded-lg" :src="props.searchEntry.imageUrl" alt="Description of Image" />
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 flex flex-grow flex-col items-center justify-between px-0.5 py-1">
      <div class="row flex-grow-1 flex h-full w-full flex-row justify-start">
        <div class="flex h-full flex-col items-start justify-center gap-y-0 px-0 py-0">
          <div class="bg-neutral-100 border-neutral-300 mb-0 line-clamp-2 flex h-full w-full flex-col flex-nowrap items-start justify-start gap-y-0 text-ellipsis rounded-lg border px-2.5 py-1.5 shadow-sm">
            <div class="z-50 flex h-full w-full items-start justify-between py-0">
              <p class="multiline-ellipsis text-gray-800 mb-0 block w-9/12 items-center justify-center px-0 pb-1 pt-0 text-start font-bold tracking-tighter">
                {{ props.searchEntry.episodeTitle }}
              </p>
              <div class="w-18 float-right -mr-1 flex h-full items-start justify-start gap-x-1.5 pl-0 pr-0">
                <div class="flex w-9 items-center justify-end">
                  <MoreButton class="absolute w-9 translate-y-1/2" :searchEntry="props.searchEntry" />
                </div>
                <div class="flex w-9 items-center justify-end">
                  <PlayButton class="w-9" :searchEntry="props.searchEntry" @click="handlePlaying" />
                </div>
              </div>
            </div>
            <div class="flex w-full justify-center">
              <div class="mb-0 mt-0 flex h-full max-h-full min-h-full justify-center rounded-lg px-0 py-0 pb-1 text-start" :key="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()">
                <div :class="`${subtitlesActivated ? 'animate__animated animate__flipInX animate__faster' : ''} vertical multiline-ellipsis text-gray-800 ml-0 mr-0 line-clamp-4 h-full w-full overflow-hidden`" v-html="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()"></div>
              </div>
            </div>
            <div :class="`m-0 flex w-full flex-col flex-nowrap items-center justify-center rounded-lg border border-none p-0 pb-0 `">
              <audio controls :class="`text-black border-neutral-200 h-10 w-full rounded-lg border shadow-sm dark:border-none dark:shadow-none ${!isSafari && !isFirefox ? 'dark:bg-[#f2f4f5] dark:hue-rotate-[200deg] dark:invert-[0.85] dark:saturate-[10] dark:filter' : ''}`">Your browser does not support the audio tag.</audio>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { usePlayerStore } from "../../store/playerStore";
import { Hit, SearchResponse } from "../../types/SearchResponse";
import TranscriptionService from "../../utils/services/TranscriptionsService";
import { SearchQuery } from "types/SearchQuery";
import { showToast as shoeToastType } from "../../utils/toastService/useToast";
const { isFirefox, isSafari } = useDevice();

const props = defineProps<{
  searchEntry: Hit;
}>();

const showToast = inject("showToast") as typeof shoeToastType;
const searchStore = useSearchStore();
const playerStore = usePlayerStore();
const { hitCache } = storeToRefs(searchStore);
const { playing } = storeToRefs(playerStore);
const subtitlesActivated: Ref<boolean> = ref(false);
const transcriptionService: TranscriptionService = new TranscriptionService();
const currentPlayingSegment: Ref<Hit> = ref(props.searchEntry);
hitCache.value[props.searchEntry.episodeGuid] = {
  hits: [props.searchEntry],
  lastFetchedPage: undefined,
  numberOfPages: undefined,
};

const handlePlaying = () => {
  playing.value = !playing.value;
};

const toggleSubtitles = () => {
  if (subtitlesActivated.value) {
    showToast("Subtitles enabled", "success", 1500, 500);
  } else {
    showToast("Subtitles disabled", "error", 1500, 500);
  }
  subtitlesActivated.value = !subtitlesActivated.value;
};

const computedStartTime = computed(() => {
  const start = parseFloat(props.searchEntry.start.toString()) || 0;
  const deviationTime = parseFloat((props.searchEntry.deviationTime || 0).toString()) || 0;
  const val = start - deviationTime;
  return val < 0 ? 0 : val;
});

async function search(searchQuery: SearchQuery) {
  console.log("====> Sending API request!");
  const searchResponse: SearchResponse = await transcriptionService.search(searchQuery);
  return searchResponse;
}

const removeDuplicateHits = (hits: Hit[]) => {
  const hitsIds: Set<string> = new Set();
  const uniqueHits: Hit[] = [];
  for (let i = 0; i < hits.length; i++) {
    const hit: Hit = hits[i];

    if (hitsIds.has(hit.id)) continue;

    // If new
    hitsIds.add(hit.id);

    // add unique hit
    uniqueHits.push(hit);
  }

  // return
  return uniqueHits;
};

const moreTextModalOpen = ref(false);

const openMoreTextModal = () => {
  moreTextModalOpen.value = !moreTextModalOpen.value;
  handleTimeUpdate(parseFloat(currentPlayingSegment.value.start.toString()) || parseFloat(props.searchEntry.start.toString()));
};

const handleTimeUpdate = async (currentTime: number) => {
  currentTime = currentTime - 0.1;
  if (subtitlesActivated.value === false && moreTextModalOpen.value === false) return;
  else {
    let episodeGuid = props.searchEntry.episodeGuid;
    // The reason for doing currentTime - 2 when it kinda should just be (currentTime) is purely because MeiliSearch is kinds shait at comparing decimals, probably a bug trollolo
    const constructedFilter: string = `belongsToEpisodeGuid='${episodeGuid}' AND (start >= ${currentTime - 2} AND start <= ${currentTime + 300})`;
    // First We gotta check if we have the currentTime hit in the episodeGuid hit array?
    let foundHit = hitCache.value[episodeGuid].hits.find((hit: Hit) => currentTime >= hit.start && currentTime <= hit.end) || null;
    // If we do, we just set
    if (foundHit) {
      console.log("CurrentTime: ", currentTime, "Found hit, setting currentPlatingSegment to the foundHit");
      console.log("HitCache: ", hitCache);
      console.log("Setting foundHit: ", foundHit);
      currentPlayingSegment.value = foundHit;
    } else {
      const hitCacheHitsLength: number = hitCache.value[episodeGuid].hits.length - 1;
      const lastElement: Hit = hitCache.value[episodeGuid].hits[hitCacheHitsLength];
      // if (currentTime <= lastElement.end) {
      //   console.log("Didn't find hitCache, but the currentTime is part of the sorted hitCache array, so we dont sent API request again.", hitCache);
      //   // Terminate early.
      //   currentPlayingSegment.value = currentPlayingSegment.value;
      // } else {
      const res: SearchResponse = await debouncedSegmentSearcher({ filter: constructedFilter, sort: ["start:asc"] });
      if (res?.hits?.length > 0) {
        // Update hitCache with new hits
        hitCache.value[episodeGuid].hits.push(...res.hits);
        hitCache.value[episodeGuid].hits = removeDuplicateHits(hitCache.value[episodeGuid].hits);

        const newlyAddedFoundHit = hitCache.value[episodeGuid].hits.find((hit: Hit) => currentTime >= hit.start && currentTime <= hit.end);
        currentPlayingSegment.value = newlyAddedFoundHit ? newlyAddedFoundHit : currentPlayingSegment.value;
        // }
      } else {
        console.log("Mamma mia!");
      }
    }
  }
};

const debouncedSegmentSearcher = _Debounce(search, 300, {
  leading: true,
  trailing: true,
  maxWait: 300,
});

const handleTimeUpdateDebounced = _Debounce(handleTimeUpdate, 300, {
  leading: true,
  trailing: true,
  maxWait: 300,
});
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
