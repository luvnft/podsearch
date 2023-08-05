<template>
  <div class="tw-h-full">
    <div class="tw-inset-y-0 tw-left-0 tw-flex tw-h-full tw-w-full tw-items-center sm:tw-hidden">
      <button
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-fill-gray-400 tw-p-2 hover:tw-bg-gray-100 hover:tw-fill-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
        @click="startRecording"
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
    <div>
      <audio v-for="recording in recordings" :src="recording.blobUrl" :type="recording.mimeType" controls="true" autoplay />
    </div>
  </div>
</template>

<script setup lang="ts">
import AudioTranscriptionService from "../../../utils/services/AudioTranscriptionService";
import { useSearchStore } from "../../../store/searchStore";
import { storeToRefs } from "pinia";
import RecorderService from "../../../composables/RecorderService/RecorderService";

const searchStore = useSearchStore();
const { searchQuery } = storeToRefs(searchStore);
const audioTranscriptionService: AudioTranscriptionService = new AudioTranscriptionService();
const loading: Ref<boolean> = ref(false);
const percentageAudioPazamed: Ref<number> = ref(0);

// Data
const enableEchoCancellation = ref(true);
const recordings: Ref<any> = ref([]);
const cleanupWhenFinished = ref(true);
let recorderService: RecorderService;

onMounted(async () => {
  recorderService = new RecorderService();
  recorderService.config.enableEchoCancellation = enableEchoCancellation.value;
  recorderService.config.stopTracksAndCloseCtxWhenFinished = cleanupWhenFinished.value;

  // Start eventlistener for this:
  recorderService.em.addEventListener("recording", (event: any) => onNewRecording(event));
});

const startRecording = async () => {
  if (recorderService && !loading.value) {
    // Ensure a recording isn't already in progress
    try {
      console.log("Started recording!");
      loading.value = true;

      await recorderService.startRecording();

      _Delay(stopRecording, 7000);
    } catch (e) {
      console.error("Error starting the recording:", e); // Log the error
      loading.value = false;
      recorderService.stopRecording();
    }
  } else {
    console.log("Recording is already in progress or recorderService is unavailable.");
  }
};

const onNewRecording = async (event: any) => {
  // This is where they go
  recordings.value.push(event.detail.recording);

  // Get the recording
  const recording = recordings.value[0];

  // Convert the blobUrl to a Blob
  const response = await fetch(recording.blobUrl);
  const audioBlob = await response.blob();

  // Prepare formData with the audio Blob
  const formData = new FormData();
  formData.append("audio", audioBlob);

  // Send recording to API
  const apiResponse: any = await audioTranscriptionService.uploadAudioFile(formData);
  if (apiResponse?.message) {
    searchQuery.value = {
      ...searchQuery.value,
      searchString: apiResponse.message,
    };
  }
  console.log(apiResponse);

  // Clear the recordings
  // recordings.value = [];
};

const stopRecording = () => {
  recorderService.stopRecording();
  console.log("Stopped recording after 7 seconds!");
};
</script>
