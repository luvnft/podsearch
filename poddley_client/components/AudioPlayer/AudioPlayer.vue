<template>
  <div class="tw-h-12 tw-w-full tw-rounded-lg tw-bg-white tw-text-sm tw-shadow-sm tw-shadow-gray-400 tw-flex tw-flex-row">
    <div class="tw-flex tw-w-14 tw-items-center tw-justify-center">
      <button class="tw-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-full hover:tw-bg-gray-200 tw-transition-all tw-duration-300 tw-fill-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
          <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
        </svg>
      </button>
    </div>
    <div class="tw-flex tw-w-22 tw-items-center tw-justify-start">
      <span>13:21/17:22</span>
    </div>
    <div class="tw-flex  tw-items-center tw-justify-start">
      <input type="range" min="0" max="100" value="0" class="tw-w-full" id="audioRange" />
    </div>
    <!-- <div class="tw-flex tw-w-full tw-items-center tw-justify-start">play</div>
    <div class="tw-flex tw-w-full tw-items-center tw-justify-start">play</div> -->
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  audioLink: string;
  startTime: number;
  episodeTitle: string;
}>();
</script>

<style scoped>
/* This will be used to show the "played" part */
input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    #82cfd0 0%,
    #82cfd0 50%,
    /* this will be the "played" part */ #fdb813 50%,
    #fdb813 75%,
    /* this will be the "buffered" part */ #c4c4c4 75%,
    #c4c4c4 100% /* this will be the "leftover" part */
  );
}

input[type="range"]::-moz-range-track {
  background: linear-gradient(
    to right,
    #82cfd0 0%,
    #82cfd0 50%,
    /* this will be the "played" part */ #fdb813 50%,
    #fdb813 75%,
    /* this will be the "buffered" part */ #c4c4c4 75%,
    #c4c4c4 100% /* this will be the "leftover" part */
  );
}
</style>
