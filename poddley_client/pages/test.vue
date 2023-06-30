<template>
  <div>
    <div class="img-container"><img src="http://placekitten.com/200/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/210/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/220/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/240/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/260/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/270/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/280/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/290/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/200" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/210" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/220" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/240" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/260" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/270" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/280" alt="" loading="lazy" /></div>
    <div class="img-container"><img src="http://placekitten.com/200/290" alt="" loading="lazy" /></div>
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
