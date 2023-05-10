<template>
  <div class="tw-w-full tw-rounded-lg tw-shadow-sm tw-shadow-gray-400">
    <div style="position: relative">
      <audio :key="props.timeLocation" controls id="custom-audio" :class="{ loading: isLoading }" class="tw-m-0 tw-w-full tw-rounded-lg tw-p-0 tw-shadow-none" ref="audioPlayerRef" preload="none" :title="props.episodeTitle" poster="https://upload.wikimedia.org/wikipedia/en/f/fd/Coldplay_-_Parachutes.png" @loadedmetadata="onLoadedMetadata" @waiting="onWaiting" @playing="onPlaying" @ended="onEnded" @error="onError">
        <source :src="props.audioLink" type="audio/mpeg" controls />
      </audio>

      <div ref="audioPlayerSpinnerRef" class="spinner" v-if="isLoading">
        <IconsSpinnerIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  audioLink: string;
  timeLocation: number;
  episodeTitle: string;
}>();

function isiPhone() {
  return /iPhone|iPod|iPad/.test(navigator.userAgent);
}

const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);
const audioPlayerSpinnerRef: Ref<HTMLDivElement | null> = ref(null);
const isLoading: Ref<Boolean> = ref(false);

const onLoadedMetadata = () => {
  if (audioPlayerSpinnerRef.value) {
    audioPlayerSpinnerRef.value.style.display = "none";
    isLoading.value = false;
  }
};

const onWaiting = () => {
  if (audioPlayerSpinnerRef.value) {
    setTimeout(() => {
      if (audioPlayerRef.value && audioPlayerRef.value.readyState < 4) {
        if (audioPlayerSpinnerRef.value) {
          audioPlayerSpinnerRef.value.style.display = "block";
          isLoading.value = true;
        }
      }
    }, 2000);
  }
};

const onPlaying = () => {
  if (audioPlayerSpinnerRef.value) {
    audioPlayerSpinnerRef.value.style.display = "none";
    isLoading.value = false;
  }
};

const onEnded = () => {
  if (audioPlayerSpinnerRef.value) {
    audioPlayerSpinnerRef.value.style.display = "none";
  }
};

const onError = () => {
  if (audioPlayerSpinnerRef.value) {
    audioPlayerSpinnerRef.value.style.display = "none";
  }
  console.error("Error loading audio");
};

onMounted(() => {
  if (audioPlayerRef.value && isiPhone() === false) {
    audioPlayerRef.value.currentTime = props.timeLocation;
    // Check if the metadata is already loaded
    if (audioPlayerRef.value.readyState >= 1) {
      onLoadedMetadata();
    }
  }
});
</script>

<style scoped>
#custom-audio {
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0;
}

#custom-audio::-webkit-media-controls-panel,
#custom-audio::-webkit-media-controls {
  background-color: #fff;
  border-radius: 0;
}

#custom-audio::-webkit-media-controls-play-button,
#custom-audio::-webkit-media-controls-volume-slider-container,
#custom-audio::-webkit-media-controls-timeline-container,
#custom-audio::-webkit-media-controls-mute-button,
#custom-audio::-webkit-media-controls-timeline,
#custom-audio::-webkit-media-controls-current-time-display {
  color: #000;
}

.spinner {
  position: absolute;
  top: 30%;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading::-webkit-media-controls-play-button {
  visibility: hidden;
}
</style>