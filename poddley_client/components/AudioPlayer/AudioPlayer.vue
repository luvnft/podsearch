<template>
  <div class="w-full">
    <div class="text-white mt-1.5">
      <audio
        :key="props.timeLocation"
        controls
        id="custom-audio"
        :class="`w-full rounded-lg ${!isIos ? '' : ''}`"
        ref="audioPlayerRef"
        :preload="'none'"
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
const { isSafari, isIos } = useDevice();
const onTimeUpdate = (event: Event) => {
  emit("timeupdate", (event.target as HTMLAudioElement).currentTime);
};

const playing = (event: Event) => {
  if (event.type === "play") emit("playing", true);
  if (event.type === "pause") emit("playing", false);
};
</script>

<style scoped>
.spinner {
  position: absolute;
  top: 30%;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
