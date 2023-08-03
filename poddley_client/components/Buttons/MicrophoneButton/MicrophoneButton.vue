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
const { searchQuery } = storeToRefs(searchStore);
const recording: Ref<boolean> = ref(false);
let RecordRTC: any = null;
let recorder: any = null;
let options: any = null;

onMounted(async () => {
  if (process.client) {
    const ImportedRTC = await import("recordrtc");
    RecordRTC = ImportedRTC.default;
    options = { audioBitsPerSecond: 256000, mimeType: "audio/webm" };
  }
});

const audioTranscriptionService: AudioTranscriptionService = new AudioTranscriptionService();
const loading: Ref<boolean> = ref(false);
const percentageAudioPazamed: Ref<number> = ref(0);
let chunks: BlobPart[] = [];

async function recordAudio() {
  if (!recording.value) {
    recording.value = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (RecordRTC) {
      recorder = new RecordRTC(stream, options);
    }

    async function stopRecording() {
      if (recorder) {
        recorder.stopRecording(async () => {
          let blob = recorder?.getBlob();
          if (blob) {
            chunks.push(blob);
            await sendData();
          }
          // Stop all tracks in the stream
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        });
      }
    }

    if (!recorder) return;
    recorder.startRecording();
    loading.value = true;
    let duration = 8000; // Duration of the recording in milliseconds

    let startTime = Date.now(); // Get the current time

    let intervalId = setInterval(() => {
      let elapsed = Date.now() - startTime; // Time elapsed in milliseconds
      let percentage = (elapsed / duration) * 100;
      percentageAudioPazamed.value = Math.floor(percentage);
    }, 100);

    setTimeout(async () => {
      await stopRecording();
      clearInterval(intervalId);
      percentageAudioPazamed.value = 100;
      loading.value = false;
      recording.value = false;
    }, duration);
  }
}

const sendData = async () => {
  const blob = new Blob(chunks, { type: "audio/wav" });
  const formData = new FormData();
  formData.append("audio", blob);

  try {
    const response: any = await audioTranscriptionService.uploadAudioFile(formData);
    alert(response.message);
    if (response?.message) {
      searchQuery.value = {
        ...searchQuery.value,
        searchString: response.message,
      };
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};
</script>
