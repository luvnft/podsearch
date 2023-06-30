<template>
  <div>
    <button>Play button</button>
    <img src="" />

    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/0YIkIDV_8Pw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIGUoSTAP&rs=AOn4CLANmZN_kP6uskQ1uCq0Wh3Of5-CPQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/6E2VjTKXD5k/hqdefault.jpg?sqp=-oaymwExCNACELwBSFryq4qpAyMIARUAAIhCGAHwAQH4Af4JgALQBYoCDAgAEAEYZSBAKFAwDw==&rs=AOn4CLCJC589MiCmSUV1MZghuw81XrZWuA"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/WbEGmghn_jo/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDieyAQFrlagGTv2vTLeSWes56Gsg"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/dGwbIjhDhOE/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCMu4sGDk1T3_YXA4CF8KFWUrPQCQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/0YIkIDV_8Pw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIGUoSTAP&rs=AOn4CLANmZN_kP6uskQ1uCq0Wh3Of5-CPQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/0YIkIDV_8Pw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIGUoSTAP&rs=AOn4CLANmZN_kP6uskQ1uCq0Wh3Of5-CPQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/0YIkIDV_8Pw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIGUoSTAP&rs=AOn4CLANmZN_kP6uskQ1uCq0Wh3Of5-CPQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
    <div class="tw-rounded-lg tw-border-4 tw-border-transparent">
      <nuxt-img
        src="https://i.ytimg.com/vi/0YIkIDV_8Pw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIGUoSTAP&rs=AOn4CLANmZN_kP6uskQ1uCq0Wh3Of5-CPQ"
        class="tw-rounded-md tw-bg-blend-darken tw-shadow-black"
        loading="lazy"
      />
    </div>
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
