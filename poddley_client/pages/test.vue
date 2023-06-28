<template>
  <div>
    <button>Play button</button>
    <img src="" />

    <iframe
      :width="props.width"
      :height="props.height"
      :src="`https://www.youtube${props.noCookie ? '-nocookie' : ''}.com/embed/${props.videoId}?start=${props.startTime}`"
      :title="props.videoTitle"
      frameborder="0"
      :allow="`accelerometer; ${props.autoplay ? 'autoplay' : ''}; clipboard-write; encrypted-media; gyroscope; ${props.pictureInPicture ? 'picture-in-picture' : ''}; web-share; ${props.allowFullscreen ? 'allowfullscreen' : ''};`"
      class = "tw-rounded-lg"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

const props = defineProps({
  videoId: {
    type: String as PropType<string>,
    required: true,
  },
  startTime: {
    type: Number as PropType<number>,
    required: false,
    default: 0,
  },
  width: {
    type: Number as PropType<number>,
    required: true,
    default: 480,
  },
  height: {
    type: Number as PropType<number>,
    required: true,
    default: 270,
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
