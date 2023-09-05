<template>
  <main class="xs:px-0 xs:py-0 bg-white min-h-screen sm:px-2 sm:py-2">
    <div class="container-fluid max-w-screen-xl px-0">
      <slot />
    </div>
    <AudioPlayer v-if="playing" />
  </main>
</template>

<script setup lang="ts">
import { usePlayerStore } from "../../store/playerStore";
import { storeToRefs } from "pinia";
const playerStore = usePlayerStore();
const { playing } = storeToRefs(playerStore);
</script>
