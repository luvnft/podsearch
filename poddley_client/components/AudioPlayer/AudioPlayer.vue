<template>
  <div class="tw-w-full tw-rounded-lg tw-shadow-sm tw-shadow-gray-400">
    <audio
      :key="props.timeLocation"
      controls
      id="custom-audio"
      class="tw-m-0 tw-w-full tw-rounded-lg tw-p-0 tw-shadow-none"
      ref="audioPlayerRef"
      preload="metadata"
      :title="props.episodeTitle"
      :src="props.audioLink"
      type="audio/mpeg"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  audioLink: string;
  timeLocation: number;
  episodeTitle: string;
}>();

const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);

onMounted(() => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.currentTime = props.timeLocation;
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

#custom-audio::-webkit-media-controls-timeline::-webkit-media-slider-thumb {
  -webkit-appearance: none;
  background-color: #000; /* Change this color to your preference */
  border-radius: 50%;
  height: 12px; /* Adjust size as needed */
  width: 12px; /* Adjust size as needed */
  margin-top: -4px; /* Adjust margin as needed */
}

#custom-audio::-webkit-media-controls-timeline::-moz-range-thumb {
  background-color: #000; /* Change this color to your preference */
  border-radius: 50%;
  height: 12px; /* Adjust size as needed */
  width: 12px; /* Adjust size as needed */
}
</style>
