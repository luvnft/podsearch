<template>
  <div class="row tw-flex tw-flex-row tw-items-start tw-rounded-xl tw-border tw-border-white tw-bg-white tw-p-3 tw-shadow-md md:tw-gap-y-0">
    <div class="col-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 col-xxl-4 py-sm-2 tw-flex tw-items-start tw-justify-center tw-rounded-sm tw-py-3 tw-pb-5">
      <div class="tw-max-h-48 tw-rounded-xl">
        <img :src="props.searchEntry.imageUrl" alt="tailwind logo" class="tw-max-h-48 tw-rounded-xl tw-object-contain" />
      </div>
    </div>
    <div class="col-12 col-sm-8 col-md-8 col-lg-8 col-xl-8 col-xxl-8 p-0 py-sm-2 tw-flex tw-flex-col tw-items-center tw-justify-center">
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
          <p>
            <b>Episode:</b>
            {{ props.searchEntry.episodeTitle }}
          </p>
          <hr />
          <div>
            <p class="tw-mb-1 tw-font-bold">Segment:</p>
            <p class="segment" v-html="'›››' + props.searchEntry._formatted.text" />
          </div>
          <hr />
          <p>
            <b>Location:</b>
            {{ convertSecondsToTime(props.searchEntry.start) }}
          </p>
        </div>
        <div class="col-12 mt-0 tw-w-full tw-pt-1 tw-pb-2">
          <AudioPlayer :audioLink="props.searchEntry.episodeEnclosure" :timeLocation="props.searchEntry.start" :episodeTitle="props.searchEntry.episodeTitle" :key="props.searchEntry.text" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Hit } from "~~/types/SearchResponse";
import { convertSecondsToTime } from "~~/utils/tools/tools";

const props = defineProps<{
  searchEntry: Hit;
}>();
</script>

<style scoped>
:deep(.highlight) {
  background: rgb(255, 255, 134) !important;
}

.segment {
  padding-right: 7px;
  padding-top: 7px;
  padding-bottom: 7px;
  background-color: white;
  padding-left: 7px;
  border-radius: 4px;
  -webkit-box-shadow: inset 0px 1px 5px 0px rgba(150, 150, 150, 1);
  -moz-box-shadow: inset 0px 1px 5px 0px rgba(150, 150, 150, 1);
  box-shadow: inset 0px 1px 5px 0px rgba(150, 150, 150, 1);
}
</style>
