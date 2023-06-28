<template>
  <div>
    <!-- <button>Play button</button> -->
    <img :src="`https://i.ytimg.com/vi_webp/${props.videoId}/${props.posterQuality}.webp`" class="tw-rounded-xl" @click="toggleiFrame()" loading="lazy" />

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
