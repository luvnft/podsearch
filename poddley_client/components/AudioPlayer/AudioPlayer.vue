<template>
  <div :class="`tw-w-full tw-rounded-lg ${!isMobile ? 'tw-shadow-sm' : ''} tw-shadow-gray-400`">
    <div style="position: relative">
      <audio
        :key="props.timeLocation"
        controls
        id="custom-audio"
        :class="{ loading: isLoading }"
        class="tw-m-0 tw-w-full tw-rounded-lg tw-p-0 tw-shadow-none"
        ref="audioPlayerRef"
        :preload="isVisible ? 'metadata' : 'none'"
        :title="props.episodeTitle"
        :src="props.audioLink"
        type="audio/mpeg"
      />

      <div ref="audioPlayerSpinnerRef" class="spinner" v-if="isLoading">
        <IconsSpinnerIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Device } from "@nuxtjs/device/dist/runtime/types";

const props = defineProps<{
  audioLink: string;
  timeLocation: number;
  episodeTitle: string;
}>();
const { isMobile }: Device = useDevice();
const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);
const audioPlayerSpinnerRef: Ref<HTMLDivElement | null> = ref(null);
const isLoading: Ref<Boolean> = ref(false);
const isVisible = useElementVisibility(audioPlayerRef);
const isPlayable: Ref<Boolean> = ref(false);

let unwatch = watch(isVisible, function (state) {
  if (audioPlayerRef.value && state === true) {
    audioPlayerRef.value.currentTime = props.timeLocation;
  }
  // stop watching after the first time
  unwatch();
});

function handleCanPlayThrough() {
  isPlayable.value = true;
}

onMounted(() => {
  console.log(`This is phone?: ", ${isMobile}`);

  if (audioPlayerRef.value) {
    audioPlayerRef.value.currentTime = props.timeLocation;
    console.log("Forcing");
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
