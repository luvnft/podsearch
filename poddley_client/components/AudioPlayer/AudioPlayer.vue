<template>
  <div class="row tw-flex tw-h-12 tw-w-full tw-flex-row tw-rounded-lg tw-bg-white tw-px-0 tw-text-sm tw-shadow-sm tw-shadow-gray-400">
    <audio ref="audioRef" :src="audioLink" @timeupdate="onTimeUpdate" @loadeddata="onLoadedData" preload="none" />
    <div class="col-2 tw-flex tw-h-full tw-items-center tw-justify-center tw-pr-0">
      <button class="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-start -tw-mr-3 tw-rounded-full tw-fill-gray-700 tw-transition-all tw-duration-300 hover:tw-bg-gray-200" @click="togglePlay">
        <div v-if="!audioIsPlaying && !isBuffering">
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" class="tw-ml-1">
            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
          </svg>
        </div>
        <div v-if="audioIsPlaying && !isBuffering">
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" class="tw-ml-[1px]">
            <path
              d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
            />
          </svg>
        </div>
        <div v-if="isBuffering" class = "tw-flex tw-justify-center tw-items-center">
          <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-fill-slate-800 tw-text-gray-400" />
        </div>
      </button>
    </div>
    <div class="col-3 tw-flex tw-h-full tw-items-center tw-justify-start tw-pl-0 tw-pr-0">
      <span>13:21/17:22</span>
    </div>
    <div class="col-3 tw-flex tw-h-full tw-items-center tw-justify-start tw-px-0">
      <input type="range" min="0" max="100" value="0" class="middle-line darkgrey-dot tw-w-full" id="audioRange" />
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

const audioRef: Ref<HTMLAudioElement | null> = ref(null);
const audioIsPlaying: Ref<boolean> = ref(false);
const currentTime: Ref<number> = ref(0);
const isBuffering: Ref<boolean> = ref(false);
const isLoaded: Ref<boolean> = ref(false);

const togglePlay = () => {
  if (audioRef.value) {
    const audioElement = audioRef.value;
    audioIsPlaying.value = !audioIsPlaying.value;

    if (audioElement.paused || audioElement.ended) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

const onLoadedData = () => {
  if (audioRef.value) {
    isLoaded.value = true;
  }
};

onMounted(() => {
  const soundEffect = new Audio();
  soundEffect.autoplay = true;

  // onClick of first interaction on page before I need the sounds
  // (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
  soundEffect.src =
    "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

  const audio = audioRef.value;
  if (audioRef.value) {
    audioRef.value.onwaiting = () => {
      isBuffering.value = true;
    };
    audioRef.value.onplaying = () => {
      isBuffering.value = false;
    };
  }
});
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
