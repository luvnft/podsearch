<template>
  <div class="h-full">
    <div class="inset-y-0 left-0 flex h-full w-full items-center sm:hidden">
      <button
        class="text-gray-400 flex h-full w-full items-center justify-center rounded-md p-2 hover:text-gray-500 hover:bg-gray-100 focus:ring-gray-500 hover:border-none focus:outline-none focus:ring-2 focus:ring-inset"
        @click="startRecording"
      >
        <div class="flex h-full w-full flex-row items-center justify-center">
          <div class="h-full w-full" v-if="!loading">
            <svg-icon name="microphone" class="block h-full w-full scale-[0.85] fill-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
          </div>
          <div class="flex h-full w-full items-center justify-center" v-if="loading">
            <div class="radial-progress text-gray-400 flex items-center justify-center after:hidden" :style="`--value: ${percentageAudioPazamed}; --thickness: 0.13rem; --size: 2rem`">
              <div class="h-full w-full" v-if="loading">
                <svg-icon name="microphone" class="text-gray-400 block h-full w-full scale-[0.55] animate-colorPulse group-hover:fill-gray-500" aria-hidden="true" />
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
const recordings: Ref<any> = ref([]);
let recorderService: RecorderService;

onMounted(async () => {
  recorderService = new RecorderService();
  recorderService.config.enableEchoCancellation = false;
  recorderService.setMicGain(3);
  recorderService.config.createDynamicsCompressorNode = false;
  recorderService.config.stopTracksAndCloseCtxWhenFinished = true;

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
