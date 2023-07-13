<template>
  <div class="tw-flex tw-flex-col tw-items-center">
    <!-- Show off iFrame -->
    <div class="video-container tw-flex" @click="toggleiFrame" v-if="!showiFrame">
      <div class="topbackground tw-absolute tw-z-10 tw-flex tw-w-full tw-flex-row tw-gap-2 tw-rounded-none tw-px-4 tw-pt-3 tw-text-white md:tw-rounded-xl">
        <div class="channelIcon tw- tw-flex tw-aspect-video tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-full before:tw-h-10 before:tw-w-10">
          <NuxtImg provider="cloudflare" :src="props.searchEntry?.imageUrl" class="image-with-vignette tw-h-full tw-rounded-full tw-brightness-75" loading="lazy" />
        </div>
        <div class="tw-flex tw-min-w-0 tw-items-center">
          <p class="tw-m-0 tw-w-full tw-flex-row tw-items-center tw-justify-start tw-overflow-hidden tw-overflow-ellipsis tw-whitespace-nowrap tw-p-0 tw-text-base">
            {{ props.videoTitle }}
          </p>
        </div>
      </div>
      <button id="playButton" class="centered-button" />

      <button class="image-with-vignette tw-rounded-none after:tw-rounded-none md:tw-rounded-xl md:after:tw-rounded-xl">
        <NuxtImg
          :src="`https://i.ytimg.com/vi_webp/${props.videoId}/${props.posterQuality}.webp`"
          @click="toggleiFrame()"
          class="tw-rounded-none tw-bg-blend-darken tw-shadow-black md:tw-rounded-xl"
          loading="lazy"
          provider="cloudflare"
        />
      </button>
    </div>

    <!-- Actual iFrame -->
    <div v-if="showiFrame" :class="`tw-bg-gray-8 tw-m-0 tw-mb-1.5 tw-flex tw-aspect-video tw-w-full tw-items-center tw-justify-center tw-p-0 tw-pb-0 ${loading ? 'tw-rounded-none tw-border' : ''}`">
      <div class="tw-flex tw-aspect-video tw-w-full tw-items-center tw-justify-center tw-p-0" v-if="loading">
        <IconsSpinnerIcon />
      </div>

      <iframe
        :src="`https://www.youtube${props.noCookie ? '-nocookie' : ''}.com/embed/${props.videoId}?start=${props.startTime}`"
        :title="props.videoTitle"
        frameborder="0"
        :allow="`accelerometer; ${props.autoplay ? 'autoplay' : ''}; clipboard-write;encrypted-media; gyroscope; ${props.pictureInPicture ? 'picture-in-picture' : ''}; web-share; ${
          props.allowFullscreen ? 'allowfullscreen' : ''
        };`"
        class="tw-aspect-video tw-w-full tw-rounded-none"
        @load="hello()"
        v-show="!loading"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Hit } from "types/SearchResponse";
import { PropType } from "vue";

type PosterQuality = "default" | "maxresdefault" | "sddefault" | "mqdefault" | "hqdefault" | "hq720" | any;

const showiFrame: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);

function toggleiFrame() {
  loading.value = true;
  showiFrame.value = true;
}

function hello() {
  console.log("Now it's loaded bitch");
  loading.value = false;
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
  searchEntry: {
    type: Object as PropType<Hit>,
    required: false,
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
  z-index: 5;
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
}

.topbackground {
  background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(255, 255, 255, 0) 100%);
}

@keyframes ripple {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 7px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

.channelIcon::before {
  content: "";
  position: absolute;
  background-color: rgb(80, 80, 80);
  border-radius: 100%;
  z-index: -1;
  animation: ripple 2s ease-out infinite;
}

.channelIcon {
  box-shadow: 0 0px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.4);
}
</style>
