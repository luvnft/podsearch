<template>
  <div class="row tw-flex tw-h-12 tw-w-full tw-flex-row tw-rounded-lg tw-bg-white tw-text-sm tw-shadow-sm tw-shadow-gray-400 tw-px-0">
    <div class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center tw-pr-0">
      <button class="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-full tw-fill-gray-700 tw-transition-all tw-duration-300 hover:tw-bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
          <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
        </svg>
      </button>
    </div>
    <div class="col-3 tw-flex tw-h-full tw-items-center tw-justify-start tw-pl-0 tw-pr-0">
      <span>13:21/17:22</span>
    </div>
    <div class="col-3 tw-flex tw-h-full tw-items-center tw-justify-start tw-px-0">
  <input type="range" min="0" max="100" value="0" class="tw-w-full middle-line darkgrey-dot" id="audioRange" />
</div>
    <div class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center">play</div>
    <div class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center">play</div>
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
/* For the middle line */
.middle-line::-webkit-slider-runnable-track {
  height: 3px;
  background: grey;
  border: none;
}

.middle-line::-moz-range-track {
  height: 3px;
  background: grey;
  border: none;
}

/* For the dark grey dot */
.darkgrey-dot::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 15px;
  width: 15px;
  background: darkgrey;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.darkgrey-dot::-moz-range-thumb {
  height: 15px;
  width: 15px;
  background: darkgrey;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

/* Styling for hover state */
.darkgrey-dot:hover::-webkit-slider-thumb {
  background: #222;
}

.darkgrey-dot:hover::-moz-range-thumb {
  background: #222;
}
</style>
