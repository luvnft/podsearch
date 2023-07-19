<template>
  <div>
    <div class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-overflow-hidden sm:tw-hidden">
      <NuxtLink
        v-if="!loading"
        href="/"
        class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-rounded-md tw-p-0 tw-text-gray-400 hover:tw-bg-gray-100 hover:tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-gray-500"
      >
        <IconsLogoIcon class="tw-scale-[0.7] tw-mt-1.5" />
      </NuxtLink>
      <IconsSpinnerIcon v-if="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../../store/searchStore";
const searchStore = useSearchStore();
const { loading } = storeToRefs(searchStore);
</script>
