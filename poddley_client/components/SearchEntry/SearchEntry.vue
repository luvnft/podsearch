<template>
  <div class="row tw-flex tw-flex-row tw-items-start tw-rounded-xl tw-border tw-border-white tw-bg-white tw-p-3 tw-shadow-md md:tw-gap-y-0">
    <div class="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 col-xxl-5 py-sm-2 tw-flex tw-items-start tw-justify-center tw-rounded-sm tw-py-3 tw-pb-5">
      <div class="tw-min-w-full tw-max-w-full tw-rounded-lg">
        <div v-if="!props.searchEntry.youtubeVideoLink" class="image-aspect-ratio tw-rounded-lg" :style="`background-image: url('${props.searchEntry.imageUrl}')`" />

        <div class="tw-rounded-lg tw-border-4 tw-border-transparent" v-if="props.searchEntry.youtubeVideoLink">
          <LiteYouTubeEmbed
            :id="(props.searchEntry.youtubeVideoLink.match(/v=([^&]+)/gi) || [''])[0].toString().slice(2)"
            :title="props.searchEntry.episodeTitle"
            :params="`start=${Math.floor(parseFloat(props.searchEntry.start.toString())) - Math.floor(parseFloat((props.searchEntry.deviationTime || 0).toString() || '0'))}`"
            webp
            poster="maxresdefault"
            wrapperClass="yt-lite tw-rounded-lg"
          />
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 col-xxl-7 p-0 py-sm-2 tw-flex tw-flex-col tw-items-center tw-justify-center">
      <div class="row row-cols-3 row-cols-sm-3 tw-pw-2 w-100 gx-1 gx-sm-3 mb-3 tw-flex tw-flex-row tw-items-center tw-justify-center">
        <div class="col m-0">
          <ButtonsPodcastButton :link="props.searchEntry.episodeLinkToEpisode" />
        </div>
        <div class="col m-0">
          <ButtonsHomepageButton :link="props.searchEntry.link" />
        </div>
        <div class="col m-0">
          <ButtonsRssButton :link="props.searchEntry.url" />
        </div>
      </div>
      <div class="row d-flex flex-grow-1 w-100">
        <div class="col-12">
          <p class="tw-my-1">
            <b>Episode:</b>
            {{ props.searchEntry.episodeTitle }}
          </p>
          <hr />
          <div>
            <p class="tw-mb-1 tw-font-bold">Segment:</p>
            <div class="segment tw-shadow tw-drop-shadow-sm">
              <div class="loader">
                <span></span>
              </div>
              <span v-html="props.searchEntry._formatted.text" />
            </div>
          </div>
          <hr />
          <p>
            <b>Time-location:</b>
            &nbsp;
            <u>{{ convertSecondsToTime(props.searchEntry.start) }}</u>
          </p>
          <hr />
        </div>
        <div class="col-12 mt-0 tw-w-full tw-pb-2 tw-pt-1">
          <AudioPlayer :audioLink="props.searchEntry.episodeEnclosure" :timeLocation="props.searchEntry.start" :episodeTitle="props.searchEntry.episodeTitle" :key="props.searchEntry.text" />
        </div>
        <!-- <div class="col-12 mt-0 tw-w-full tw-pt-1 tw-pb-2" v-if="props.searchEntry.youtubeVideoLink">
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Hit } from "~~/types/SearchResponse";
import { convertSecondsToTime } from "~~/utils/tools/tools";
import LiteYouTubeEmbed from "vue-lite-youtube-embed";
import "vue-lite-youtube-embed/style.css";

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
  border-radius: 4px;
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
