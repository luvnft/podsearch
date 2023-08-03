<template>
  <div class="tw-h-full">
    <div class="tw-inset-y-0 tw-left-0 tw-flex tw-h-full tw-w-full tw-items-center sm:tw-hidden">
      <button
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-fill-gray-400 tw-p-2 hover:tw-bg-gray-100 hover:tw-fill-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
        @click="recordAudio"
      >
        <div class="tw-flex tw-h-full tw-w-full tw-flex-row tw-items-center tw-justify-center">
          <div class="tw-h-full tw-w-full" v-if="!loading">
            <svg-icon name="microphone" class="tw-block tw-h-full tw-w-full tw-scale-[0.85] tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
          </div>
          <div class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center" v-if="loading">
            <div
              class="tw-radial-progress tw-flex tw-items-center tw-justify-center tw-text-gray-400 after:tw-hidden"
              :style="`--value: ${percentageAudioPazamed}; --thickness: 0.13rem; --size: 2rem`"
            >
              <div class="tw-h-full tw-w-full" v-if="loading">
                <svg-icon name="microphone" class="tw-block tw-h-full tw-w-full tw-scale-[0.55] tw-animate-colorPulse tw-text-gray-400 group-hover:tw-fill-gray-500" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AudioTranscriptionService from "../../../utils/services/AudioTranscriptionService";
import { useSearchStore } from "../../../store/searchStore";
import { storeToRefs } from "pinia";
const searchStore = useSearchStore();
const { isSafari } = useDevice();
const { searchQuery } = storeToRefs(searchStore);
const recording: Ref<boolean> = ref(false);
const audioTranscriptionService: AudioTranscriptionService = new AudioTranscriptionService();
const loading: Ref<boolean> = ref(false);
const percentageAudioPazamed: Ref<number> = ref(0);
let stream: MediaStream;
let options: any = null;
let chunks: BlobPart[] = [];
</script>
