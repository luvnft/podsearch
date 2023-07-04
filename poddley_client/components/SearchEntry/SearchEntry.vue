<template>
  <div class="row tw-flex tw-flex-row tw-items-start tw-rounded-xl tw-border tw-border-white tw-bg-white tw-p-3 tw-shadow-md md:tw-gap-y-0">
    <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 py-sm-2 tw-flex tw-items-start tw-justify-center tw-rounded-sm tw-py-2.5 tw-pb-2">
      <div class="tw-min-w-full tw-max-w-full tw-rounded-lg">
        <div v-if="props.searchEntry.youtubeVideoLink">
          <LiteYoutubeEmbed
            :videoId="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)"
            :startTime="parseFloat(`${Math.floor(parseFloat(props.searchEntry.start.toString())) - Math.floor(parseFloat((props.searchEntry.deviationTime || 0).toString()))}`)"
            :width="'100%'"
            :height="'auto'"
            :videoTitle="props.searchEntry.episodeTitle"
            :autoplay="false"
            :allowFullscreen="true"
            :pictureInPicture="true"
            :noCookie="true"
            :posterQuality="'hq720'"
          />
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-6 py-sm-2 tw-flex tw-min-h-full tw-flex-col tw-items-center tw-justify-center tw-px-0 tw-py-0">
      <!-- <div class="row row-cols-4 row-cols-sm-4 tw-pw-2 gx-1 gx-sm-3 tw-mb-3 tw-flex tw-w-full tw-flex-row tw-items-center tw-justify-center">
        <div class="col tw-m-0">
          <ButtonsPodcastButton :link="props.searchEntry.episodeLinkToEpisode" />
        </div>
        <div class="col tw-m-0">
          <ButtonsHomepageButton :link="props.searchEntry.link" />
        </div>
        <div class="col tw-m-0">
          <ButtonsRssButton :link="props.searchEntry.url" />
        </div>
        <div class="col tw-m-0">
          <ButtonsCopyLinkButton :segmentId="props.searchEntry.id" />
        </div>
      </div> -->
      <div class="row flex-grow-1 tw-flex tw-h-full tw-w-full">
        <div class="col-12 tw-flex tw-flex-col tw-gap-y-0">
          <div>
            <p class="tw-mb-2.5 tw-font-bold">
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
              <u>{{ convertSecondsToTime(props.searchEntry.start) }}</u>
            </p>
          </div>
        </div>
        <!-- <div class="col-12 mt-0 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-pb-0 tw-pt-0">
          <AudioPlayer :audioLink="props.searchEntry.episodeEnclosure" :timeLocation="props.searchEntry.start" :episodeTitle="props.searchEntry.episodeTitle" :key="props.searchEntry.text" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Hit } from "~~/types/SearchResponse";
import { convertSecondsToTime } from "../../utils/tools/tools";

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
