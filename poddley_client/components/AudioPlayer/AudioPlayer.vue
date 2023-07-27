<template>
  <div :class="`customShadow tw-w-full tw-rounded-lg ${!isIos ? 'tw-shadow-gray-400' : ''}`">
    <div>
      <audio
        :key="props.timeLocation"
        controls
        id="custom-audio"
        :class="{ loading: isLoading }"
        class="tw-m-0 tw-w-full tw-rounded-lg tw-p-0 tw-shadow-none"
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

const { isIos }: Device = useDevice();
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
  --tw-shadow: 0 0 2px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4) !important;
  --tw-shadow-colored: 0 3px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color) !important;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
}
</style>
