<template>
  <div class="tw-mx-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-border-b tw-border-gray-300 tw-bg-white tw-p-0 tw-shadow-sm md:tw-gap-y-0">
    <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 flex tw-m-0 tw-flex tw-flex-col tw-items-start tw-justify-center tw-px-0 tw-pb-1.5">
      <div class="tw-min-h-full tw-min-w-full tw-max-w-full">
        <div v-if="props.searchEntry.youtubeVideoLink">
          <LiteYoutubeEmbed
            :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)"
            :startTime="parseFloat(`${Math.floor(parseFloat(props.searchEntry.start.toString())) - Math.floor(parseFloat((props.searchEntry.deviationTime || 0).toString()))}`)"
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
        <NuxtImg v-else loading="lazy" class="tw-aspect-video tw-h-full tw-rounded-none tw-bg-cover tw-bg-top md:tw-rounded-xl" :src="props.searchEntry.imageUrl" />
      </div>
    </div>
    <div
      class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 py-sm-2 flex flex-col justify-between leading-normal tw-flex tw-min-h-full tw-flex-col tw-items-center tw-justify-center tw-px-3 tw-py-1"
    >
      <div class="row tw-w-full tw-pb-2 tw-pt-1">
        <div class="col-3 tw-px-1">
          <ButtonsPodcastButton :link="searchEntry.episodeLinkToEpisode" />
        </div>
        <div class="col-3 tw-px-1">
          <ButtonsHomepageButton :link="searchEntry.link" />
        </div>
        <div class="col-3 tw-px-1">
          <ButtonsRssButton :link="searchEntry.url" />
        </div>
        <div class="col-3 tw-px-1">
          <ButtonsCopyLinkButton :segmentId="searchEntry.id" />
        </div>
      </div>

      <div class="row flex-grow-1 tw-flex tw-h-full tw-w-full">
        <div class="col-12 tw-flex tw-flex-col tw-gap-y-0 tw-px-0 tw-pb-2 tw-pt-0">
          <div>
            <p class="tw-mb-2 tw-font-bold">
              {{ props.searchEntry.episodeTitle }}
            </p>
          </div>
          <div>
            <div class="segment tw-mb-1.5 tw-mt-1 tw-rounded-lg">
              <div class="loader">
                <span></span>
                &nbsp;
              </div>
              <span v-html="props.searchEntry._formatted.text.trim()" />
            </div>
          </div>
          <div>
            <p class="tw-mb-0 tw-mt-1.5">
              <b>Time-location:</b>
              &nbsp;
              <u>{{ utils.convertSecondsToTime(props.searchEntry.start) }}</u>
            </p>
          </div>
        </div>
        <div class="col-12 mt-0 pb-2 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-border-none tw-px-0 tw-pb-0 tw-pt-0">
          <AudioPlayer
            :audioLink="props.searchEntry.episodeEnclosure"
            :timeLocation="props.searchEntry.start"
            :episodeTitle="props.searchEntry.episodeTitle"
            :key="props.searchEntry.text"
            :startTime="parseFloat(`${Math.floor(parseFloat(props.searchEntry.start.toString()))}`)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Utils } from "composables/useUtils";
import { Hit } from "~~/types/SearchResponse";

const utils: Utils = useUtils();
const props = defineProps<{
  searchEntry: Hit;
}>();
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
