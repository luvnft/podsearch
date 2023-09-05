import { defineStore } from "pinia";

export const usePlayerStore = defineStore("playerStore", () => {
  const playing: Ref<boolean> = ref(false);
  const playingPodcastEnclosure: Ref<string> = ref("");
  //Returning
  return {
    playing,
    playingPodcastEnclosure,
  };
});
