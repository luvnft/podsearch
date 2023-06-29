<template>
  <div>
    <div class="video-container" v-if="!showiFrame" @click="toggleiFrame">
      <div class="tw-absolute tw-z-20 tw-flex tw-w-full tw-flex-row tw-gap-2 tw-px-4 tw-py-3 tw-text-white">
        <div class="tw-flex tw-aspect-video tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-full">
          <nuxt-img :src="`https://i.ytimg.com/vi_webp/${props.videoId}/hq720.webp`" class="tw-h-full tw-rounded-full image-with-vignette tw-border tw-border-gray-950 tw-brightness-75" />
        </div>
        <p class="tw-m-0 tw-flex tw-w-full tw-items-center tw-justify-start tw-overflow-hidden tw-overflow-ellipsis tw-whitespace-nowrap tw-p-0 tw-text-base">
          {{ props.videoTitle }}
        </p>
      </div>
      <button id="playButton" class="centered-button" />

      <button class="image-with-vignette tw-rounded-xl">
        <nuxt-img :src="`https://i.ytimg.com/vi_webp/${props.videoId}/${props.posterQuality}.webp`" @click="toggleiFrame()" class="tw-rounded-xl tw-bg-blend-darken tw-shadow-black" />
      </button>
    </div>
    <div v-if="showiFrame">
      <iframe
        :src="`https://www.youtube${props.noCookie ? '-nocookie' : ''}.com/embed/${props.videoId}?start=${props.startTime}`"
        :title="props.videoTitle"
        frameborder="0"
        :allow="`accelerometer; ${props.autoplay ? 'autoplay' : ''}; clipboard-write; encrypted-media; gyroscope; ${props.pictureInPicture ? 'picture-in-picture' : ''}; web-share; ${
          props.allowFullscreen ? 'allowfullscreen' : ''
        };`"
        class="tw-rounded-xl"
        width="100%"
        :style="{
          aspectRatio: '16/9',
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

type PosterQuality = "default" | "maxresdefault" | "sddefault" | "mqdefault" | "hqdefault" | "hq720";

const showiFrame: Ref<boolean> = ref(false);

function toggleiFrame() {
  showiFrame.value = true;
}

const props = defineProps({
  videoId: {
    type: String as PropType<string>,
    required: true,
  },
  posterQuality: {
    type: String as PropType<PosterQuality>,
    required: true,
  },
  startTime: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
  width: {
    type: String as PropType<string>,
    required: true,
    default: "480",
  },
  height: {
    type: String as PropType<string>,
    required: true,
    default: "100%",
  },
  videoTitle: {
    type: String as PropType<string>,
    required: false,
    default: "Video Title",
  },
  autoplay: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: false,
  },
  allowFullscreen: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: true,
  },
  pictureInPicture: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: true,
  },
  noCookie: {
    type: Boolean as PropType<boolean>,
    required: false,
    default: false,
  },
});
</script>

<style scoped>
.video-container {
  position: relative;
}

.centered-button {
  width: 68px;
  height: 48px;
  aspect-ratio: "16/9";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');
  background-repeat: no-repeat;
  z-index: 10;
}

.image-with-vignette {
  position: relative;
  display: inline-block;
}

.image-with-vignette::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: radial-gradient(circle, rgba(2, 0, 36, 0) 0%, rgba(0, 0, 0, 0.799) 100%);
  pointer-events: none;
  border-radius: 0.75rem /* 12px */ !important;
}
</style>
