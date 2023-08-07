<template>
  <div :class="`w-full rounded-lg ${!isIos || !isApple || !isSafari ? 'shadow-xs shadow-gray-400' : ''}`">
    <div>
      <audio
        :key="props.timeLocation"
        controls
        id="custom-audio"
        :class="{ loading: isLoading }"
        class="m-0 w-full rounded-lg p-0 shadow-none bg-white"
        ref="audioPlayerRef"
        :preload="'none'"
        :title="props.episodeTitle"
        :src="props.audioLink"
        type="audio/mpeg"
        @timeupdate="onTimeUpdate"
        @playing="onStartedPlay"
      />

      <div ref="audioPlayerSpinnerRef" class="spinner" v-if="isLoading">
        <IconsSpinnerIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Device } from "@nuxtjs/device/dist/runtime/types";
import { useElementVisibility } from "@vueuse/core";

const props = defineProps<{
  audioLink: string;
  timeLocation: number;
  episodeTitle: string;
}>();
const emit = defineEmits<{
  (event: "timeupdate", currentTime: number): void;
  (event: "isVisible", isVisible: boolean);
  (event: "onStartedPlay", startedPlay: boolean);
}>();

const { isIos, isSafari, isApple }: Device = useDevice();
const audioPlayerRef: Ref<HTMLAudioElement | null> = ref(null);
const audioPlayerSpinnerRef: Ref<HTMLDivElement | null> = ref(null);
const isLoading: Ref<Boolean> = ref(false);
const isVisible = useElementVisibility(audioPlayerRef);

let unwatch = watch(isVisible, function (state) {
  if (audioPlayerRef.value && state === true) {
    audioPlayerRef.value.currentTime = props.timeLocation;
  }
  // stop watching after the first time
  unwatch();
});

onMounted(() => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.currentTime = props.timeLocation;
  }
});

const onTimeUpdate = (event: Event) => {
  emit("timeupdate", (event.target as HTMLAudioElement).currentTime);
};

const onStartedPlay = () => {
  emit("onStartedPlay", true);
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

.customShadow {
  --shadow: 0 0 2px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4) !important;
  --shadow-colored: 0 3px 3px 0 var(--shadow-color), 0 1px 2px -1px var(--shadow-color) !important;
  box-shadow: var(--ring-offset-shadow, 0 0 #0000), var(--ring-shadow, 0 0 #0000), var(--shadow) !important;
}
</style>
