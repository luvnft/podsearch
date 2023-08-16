<template>
  <div class="w-full">
    <div>
      <audio
        :key="props.timeLocation"
        controls
        id="custom-audio"
        :class="{ loading: isLoading }"
        class="bg-neutral-100 border-gray-300 m-0 w-full rounded-lg border p-0 dark:bg-gray-800 dark:border-none dark:brightness-[0.85] dark:invert"
        ref="audioPlayerRef"
        :preload="'metadata'"
        :title="props.episodeTitle"
        :src="props.audioLink"
        type="audio/mpeg"
        @timeupdate="onTimeUpdate"
        @play="playing"
        @pause="playing"
      />

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
const emit = defineEmits<{
  (event: "timeupdate", currentTime: number): void;
  (event: "playing", playing: boolean);
}>();

const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);
const audioPlayerSpinnerRef: Ref<HTMLDivElement | null> = ref(null);
const isLoading: Ref<Boolean> = ref(false);

const onTimeUpdate = (event: Event) => {
  emit("timeupdate", (event.target as HTMLAudioElement).currentTime);
};

const playing = (event: Event) => {
  if(event.type === "play") emit("playing", true);
  if(event.type === "pause") emit("playing", false);
};

</script>

<style scoped>
#custom-audio {
  border-radius: 0;
}

#custom-audio::-webkit-media-controls-panel,
#custom-audio::-webkit-media-controls {
  border-radius: 0;
}

#custom-audio::-webkit-media-controls-play-button,
#custom-audio::-webkit-media-controls-volume-slider-container,
#custom-audio::-webkit-media-controls-timeline-container,
#custom-audio::-webkit-media-controls-mute-button,
#custom-audio::-webkit-media-controls-timeline,
#custom-audio::-webkit-media-controls-current-time-display {
  color: #282828;
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
