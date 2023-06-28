<template>
  <div @click="addIframe">
    <img src="" />
    <button id="playButton" :aria-label="altText"></button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

type ImageResolution = "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";

const props = defineProps({
  videoId: {
    type: String,
    required: true,
  },
  playlistId: {
    type: String,
    default: "",
  },
  videoTitle: {
    type: String,
    default: "Video",
  },
  videoPlay: {
    type: String,
    default: "Play",
  },
  videoStartAt: {
    type: String,
    default: "0",
  },
  autoLoad: {
    type: Boolean,
    default: false,
  },
  noCookie: {
    type: Boolean,
    default: false,
  },
  posterQuality: {
    type: Object as PropType<ImageResolution>,
    default: "hqdefault",
  },
  posterLoading: {
    type: String,
    default: "lazy",
  },
  params: {
    type: String,
    default: "",
  },
  short: {
    type: Boolean,
    default: false,
  },
  webp: {
    type: Boolean,
    default: false,
  },
  thumbnail: {
    type: String,
    required: false,
  },
  playlist: {
    type: Boolean,
    required: false,
    default: false,
  },
  playlistCoverId: {
    type: String,
    required: false,
    default: "",
  },
});

function getYoutubeImage() {
  const format = props.webp ? "webp" : "jpg";
  const vi = props.webp ? "vi_webp" : "vi";
  const videoPlaylistCoverId = typeof props.playlistCoverId === "string" ? encodeURIComponent(props.playlistCoverId) : null;

  return (
    props.thumbnail ||
    (!props.playlist
      ? `https://i.ytimg.com/${vi}/${props.videoId}/${props.posterQuality}.${format}`
      : `https://i.ytimg.com/${vi}/${videoPlaylistCoverId}/${props.posterQuality}.${format}`)
  );
}
console.log("OK");
console.log(getYoutubeImage());

// const isIframeLoaded = ref(false);

// const addIframe = () => {
//   if (!isIframeLoaded.value) {
//     let autoplay = 1;
//     const wantsNoCookie = props.noCookie ? "-nocookie" : "";
//     let embedTarget;
//     if (props.playlistId) {
//       embedTarget = `?listType=playlist&list=${props.playlistId}&`;
//     } else {
//       embedTarget = `${props.videoId}?`;
//     }
//     if (isYouTubeShort()) {
//       props.params = `loop=1&mute=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=${props.videoId}`;
//       autoplay = 1;
//     }
//     const iframeHTML = `
//   <iframe frameborder="0" title="${props.videoTitle}"
//     allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
//     src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}autoplay=${autoplay}&${props.params}"
//   ></iframe>`;
//     document.querySelector("#frame").insertAdjacentHTML("beforeend", iframeHTML);
//     isIframeLoaded.value = true;
//   }
// };

// const isYouTubeShort = () => {
//   return props.short && window.matchMedia("(max-width: 40em)").matches;
// };

// const warmConnections = () => {
//   const urls = ["https://i.ytimg.com/", "https://s.ytimg.com", "https://www.youtube.com", "https://www.google.com", "https://googleads.g.doubleclick.net", "https://static.doubleclick.net"];

//   urls.forEach((url) => {
//     const linkElem = document.createElement("link");
//     linkElem.rel = "preconnect";
//     linkElem.href = url;
//     linkElem.crossOrigin = "true";
//     document.head.append(linkElem);
//   });
// };
</script>

<style scoped>
:host {
  contain: content;
  display: block;
  position: relative;
  width: 100%;
  padding-bottom: calc(100% / (16 / 9));
}

@media (max-width: 40em) {
  :host([short]) {
    padding-bottom: calc(100% / (9 / 16));
  }
}

#frame,
#fallbackPlaceholder,
iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
}

#frame {
  cursor: pointer;
}

#fallbackPlaceholder {
  object-fit: cover;
}

#frame::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  background-image: linear-gradient(180deg, #111 -20%, transparent 90%);
  height: 60px;
  width: 100%;
  z-index: 1;
}

#playButton {
  width: 68px;
  height: 48px;
  background-color: transparent;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');
  z-index: 1;
  border: 0;
  border-radius: inherit;
}

#playButton:before {
  content: "";
  border-style: solid;
  border-width: 11px 0 11px 19px;
  border-color: transparent transparent transparent #fff;
}

#playButton,
#playButton:before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  cursor: inherit;
}

/* Post-click styles */
.activated {
  cursor: unset;
}

#frame.activated::before,
#frame.activated > #playButton {
  display: none;
}
</style>
