import { defineStore } from "pinia";
export const useGlobalStore = defineStore("globalStore", () => {
  //Microhpone enabled state
  const microphoneEnabled = ref(false);

  //Toggle microphone 
  function toggleMicrophone() {
    microphoneEnabled.value = !microphoneEnabled.value;
  }

  //Returning
  return {
    microphoneEnabled,
    toggleMicrophone,
  };
});
