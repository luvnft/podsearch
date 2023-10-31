<template>
    <div class="flex h-full flex-col items-center">
        <div class="video-container flex w-full border-none shadow-none" @click="toggleiFrame" v-if="!showiFrame">
            <div
                class="nightwind-prevent text-white via-black from-black opacity-90 absolute z-10 flex w-full flex-row items-center justify-start bg-gradient-to-b p-[11px] rounded-lg">
                <div
                    class="channelIcon flex aspect-video h-10 w-10 items-center justify-center rounded-full before:h-10 before:w-10">

                    <ImageWrapper v-if="props.searchEntry?.podcastImage" :width="500"
                        :imageUrl="props.searchEntry?.podcastImage"
                        class="image-with-vignette h-full rounded-full brightness-75 after:rounded-lg" />
                </div>
                <a class="flex min-w-0 items-center" :href="props.searchEntry?.youtubeVideoLink">
                    <p class="m-0 w-full flex-row items-center justify-start overflow-hidden overflow-ellipsis whitespace-nowrap p-0 text-base"
                        style="color: rgb(246, 246, 246)">
                        {{ props.videoTitle }}
                    </p>
                </a>
            </div>
            <div>
                <button name="youtubePlayButton" class="centered-button dark:stroke-slate-500 dark:stroke-1 dark:grayscale"
                    aria-label="youtubePlayButton" />
            </div>
            <button
                class="flex h-full w-full min-w-full items-center justify-center rounded border-none shadow-none after:rounded-lg md:rounded-lg md:after:rounded-lg">
                <img loading="lazy"
                    class="aspect-video h-full w-full rounded-lg border-none bg-cover bg-center pb-0 bg-blend-darken shadow-none sm:rounded-lg md:rounded-lg"
                    style="object-fit: cover; object-position: center"
                    :src="`https://i.ytimg.com/vi_webp/${props.videoId}/${props.posterQuality}.webp`"
                    :alt="`Image of the youtube video for ${props.videoTitle}`" @click="toggleiFrame()" />
            </button>
        </div>

        <div v-if="showiFrame"
            :class="`bg-gray-8 m-0 mb-1.5 flex aspect-video h-full w-full items-center justify-center rounded-lg p-0 pb-0 ${loading ? 'rounded-none border' : ''}`">
            <div class="flex aspect-video w-full items-center justify-center p-0" v-if="loading">
                <IconsSpinnerIcon />
            </div>
            <iframe v-if="props.searchEntry?.youtubeVideoLink"
                :src="`https://www.youtube${props.noCookie ? '-nocookie' : ''}.com/embed/${props.videoId}?start=${props.startTime}&autoplay=1&enablejsapi=1`"
                :title="props.videoTitle" frameborder="0"
                :allow="`accelerometer; ${props.autoplay ? 'autoplay' : 'autoplay'}; clipboard-write; encrypted-media; gyroscope; ${props.pictureInPicture ? 'picture-in-picture' : ''}; web-share`"
                :allowFullscreen="props.allowFullscreen ? 'allowfullscreen' : null"
                class="aspect-video h-full w-full rounded-lg" @load="iFrameLoaded" v-show="loading === false"
                ref="iFramePlayer" :id="props.searchEntry?.episodeGuid" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ClientSearchResponseHit } from "types/ClientSearchResponse";
import { PropType } from "vue";
type PosterQuality = "default" | "maxresdefault" | "sddefault" | "mqdefault" | "hqdefault" | "hq720";
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
        type: Object as PropType<ClientSearchResponseHit>,
        required: false,
    },
});

const emit = defineEmits<{
    (e: "timeupdate", number: number): void;
}>();

let interval: any = undefined;
let player: any = undefined;
const showiFrame: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);
const iFramePlayer: Ref<any> = ref(null);

function iFrameLoaded() {
    console.log("loaded")
    loading.value = false;
    // initPlayer(); // This function here lets the youtube stuff also be in sync with the subs but the issue is that this will not work if there is even 10 second deviation in the video. That would require me to transcribe the video and the podcast which seems super unnecessary. But then again, maybe in the future I could add some kind of deviationTime to each single segment, but not now
}

function toggleiFrame() {
    console.log("OK");
    loading.value = true;
    showiFrame.value = true;
}


function initPlayer() {
    console.log("iFramePlayer", iFramePlayer.value)
    player = new (window as any).YT.Player(iFramePlayer.value, {
        events: {
            'onReady': onPlayerReady,
        }
    })
}

function onPlayerReady(event: any) {
    console.log("SOmeone is ready baby")
    startMonitoringPlayback();
}

function startMonitoringPlayback() {
    if (interval) return;  // if already monitoring, just return

    interval = setInterval(() => {
        const currentTime = player?.playerInfo?.currentTime
        console.log(currentTime); // you can replace this with any function or logic you want
        emit("timeupdate", currentTime);
    }, 300); // checks every second
}

function stopMonitoringPlayback() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

onBeforeUnmount(() => {
    stopMonitoringPlayback();
})
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
    stroke: black !important;
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
    background-color: rgb(9, 9, 9);
    border-radius: 100%;
    z-index: -1;
    animation: ripple 2s ease-out infinite;
}

.channelIcon {
    box-shadow: 0 0px 2px rgba(0, 0, 0, 0.3), 0 0px 1px rgba(0, 0, 0, 0.4);
}

.bgbg {
    background: rgb(0, 0, 0) !important;
    background: linear-gradient(90deg, rgba(0, 0, 0, 1) 20%, rgba(255, 255, 255, 1) 100%) !important;
}
</style>
