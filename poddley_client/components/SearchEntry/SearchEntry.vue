<template>
  <div class="tw-mx-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-border-b tw-border-gray-300 tw-bg-white tw-p-0 tw-shadow-sm md:tw-gap-y-0">
    <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 flex tw-m-0 tw-flex tw-flex-col tw-items-start tw-justify-center tw-px-0 tw-pb-1.5">
      <div class="tw-min-h-full tw-min-w-full tw-max-w-full">
        <div v-if="props.searchEntry.youtubeVideoLink">
          <LiteYoutubeEmbed
            :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)"
            :startTime="computedStartTime"
            width="100%"
            height="auto"
            :videoTitle="props.searchEntry.episodeTitle"
            :autoplay="false"
            :allowFullscreen="true"
            :pictureInPicture="true"
            :noCookie="true"
            posterQuality="hqdefault"
            :searchEntry="props.searchEntry"
          />
        </div>
        <img
          v-else
          loading="lazy"
          class="tw-aspect-video tw-h-full tw-w-full tw-rounded-none tw-bg-cover tw-bg-top md:tw-rounded-xl"
          style="object-fit: cover; object-position: top"
          :src="props.searchEntry.imageUrl"
          alt="Description of Image"
        />
      </div>
    </div>
    <div
      class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 py-sm-2 flex flex-col justify-between leading-normal tw-flex tw-min-h-full tw-flex-col tw-items-center tw-justify-center tw-px-3 tw-py-1"
    >
      <div class="row flex-grow-1 tw-flex tw-h-full tw-w-full">
        <div class="col-12 tw-flex tw-flex-col tw-gap-y-0 tw-px-0 tw-pb-2 tw-pt-0">
          <div class="tw-mb-2 tw-flex tw-w-full tw-flex-row tw-flex-nowrap tw-items-center tw-justify-between tw-pr-1">
            <p class="tw-mb-0 tw-font-bold">
              {{ props.searchEntry.episodeTitle }}
            </p>
            <MoreButton :searchEntry="searchEntry" />
          </div>
          <div>
            <div class="segment tw-mb-1.5 tw-mt-1 tw-flex tw-rounded-lg" :key="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()">
              <div class="loader" v-if="subtitlesActivated">
                <span></span>
                &nbsp;
              </div>
              <div class="animate__animated animate__flipInX animate__faster">
                <span v-html="currentPlayingSegment?._formatted?.text.trim() || props.searchEntry._formatted.text.trim()" />
              </div>
            </div>
          </div>
          <div class="tw-my-1 tw-flex tw-flex-row tw-items-center tw-justify-between tw-pr-0.5">
            <p class="tw-m-0">
              <b>Time-location:</b>
              &nbsp;
              <u>{{ utils.convertSecondsToTime(currentPlayingSegment?.start || props.searchEntry.start) }}</u>
            </p>
            <ButtonsSubtitlesButton :activated="subtitlesActivated" @click="toggleSubtitles" />
          </div>
        </div>
        <div class="col-12 mt-0 pb-2 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-border-none tw-px-0 tw-pb-0 tw-pt-0">
          <AudioPlayer
            :audioLink="props.searchEntry.episodeEnclosure"
            :timeLocation="props.searchEntry.start"
            :episodeTitle="props.searchEntry.episodeTitle"
            :key="props.searchEntry.text"
            :startTime="parseFloat(`${Math.floor(parseFloat(props.searchEntry.start.toString()))}`)"
            @timeupdate="handleTimeUpdateDebounced"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Utils } from "composables/useUtils";
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
import { Hit, SearchResponse } from "~~/types/SearchResponse";
import TranscriptionService from "../../utils/services/TranscriptionsService";
import { SearchQuery } from "types/SearchQuery";
import "animate.css";

const searchStore = useSearchStore();
const { hitCache } = storeToRefs(searchStore);

const props = defineProps<{
  searchEntry: Hit;
}>();

const subtitlesActivated: Ref<boolean> = ref(false);
const utils: Utils = useUtils();
const transcriptionService: TranscriptionService = new TranscriptionService();
const currentPlayingSegment: Ref<Hit> = ref(props.searchEntry);
hitCache.value[props.searchEntry.episodeGuid] = {
  hits: [props.searchEntry],
  lastFetchedPage: undefined,
  numberOfPages: undefined,
};

const toggleSubtitles = () => {
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

const handleTimeUpdate = async (currentTime: number) => {
  currentTime = currentTime - 0.1;
  if (!subtitlesActivated.value) return;
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
  background: rgb(255, 255, 134) !important;
}

.loader {
  display: inline-flex;
}

.loader span {
  opacity: 0;
  animation: blink 1s infinite;
}

.loader span:after {
  content: "›";
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
  background-color: white;
  padding-left: 7px;
  box-shadow: 0 0px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.4);
}

.image-aspect-ratio {
  background-size: cover;
  background-position: center;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  position: relative;
  box-shadow: 0 0 1px #5e5e5e, 0 0 1px #383838, 0 0 2px #141414;
}
</style>
