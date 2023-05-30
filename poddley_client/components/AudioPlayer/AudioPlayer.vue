<template>
  <audio
    :key="props.timeLocation"
    controls
    id="custom-audio"
    class="tw-w-full tw-rounded-lg tw-shadow-sm tw-shadow-gray-400"
    ref="audioPlayerRef"
    :preload="isVisible ? 'metadata' : 'none'"
    :title="props.episodeTitle"
    :src="props.audioLink"
    type="audio/mpeg"
  />
</template>

<script lang="ts" setup>
import { useElementVisibility } from "@vueuse/core";

const props = defineProps<{
  audioLink: string;
  timeLocation: number;
  episodeTitle: string;
}>();
const { isApple } = useDevice();
const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);
const isVisible = useElementVisibility(audioPlayerRef);

let unwatch = watch(isVisible, function (state) {
  if (audioPlayerRef.value && state === true) {
    audioPlayerRef.value.currentTime = props.timeLocation;
  }
  // stop watching after the first time
  unwatch();
});
</script>

<style scoped>
#custom-audio {
  background-color: #fff;
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
</style>
