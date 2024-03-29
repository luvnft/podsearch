<template>
    <div ref="listRef" class="relative">
        <button v-for="(subHit, index) in autoSubHits" @click="goToAudioTime(subHit.start)"
            class="text-start whitespace-normal m-0 cursor w-full h-6 italic pl-1 pr-0 rounded-md overflow-hidden"
            :class="`${(((subHit.start < props.currentPlayingTime) && (subHit.end > props.currentPlayingTime))) ? 'highlight' : props.currentPlayingTime <= props.searchEntry.subHits[0].end ? 'toggleDeepStyling' : ''}`"
            v-html="convertSegmentHitToFormattedText(subHit)">
        </button>
    </div>
</template>

<script lang="ts" setup>
import type { ClientSearchResponseHit, ClientSegmentHit } from '../../types/ClientSearchResponse';
import scrollIntoView from 'scroll-into-view-if-needed';
const listRef: Ref<HTMLElement | null> = ref(null);

const emit = defineEmits<{
    (e: "goToAudioTime", number: number): void;
}>();

const props = defineProps<{
    searchEntry: ClientSearchResponseHit;
    currentPlayingTime: number;
    subtitlesActivated: Ref<boolean>;
    playingYoutube: Ref<boolean>;
}>();

const goToAudioTime = (moveToTime: number) => {
    emit("goToAudioTime", moveToTime)
}

const autoSubHits: Ref<ClientSegmentHit[]> = ref([]);

watchEffect(() => {
    if (props.playingYoutube.value) autoSubHits.value = props.searchEntry.youtubeSubHits;
    else autoSubHits.value = props.searchEntry.subHits;
});

watch(
    () => props.subtitlesActivated,
    (newValue) => {

        if (newValue) {
            setupWatcher(); // set up watcher if subsActivated is true
        } else {
            stopWatch(); // tear down watcher if subsActivated is false
        }
    }
);

let stopWatch: any = undefined;

function setupWatcher() {
    stopWatch = watch(
        // watch accepts the source data that you want to observe.
        () => [props.currentPlayingTime, props.searchEntry.subHits],
        () => {
            if (listRef.value && props.searchEntry.subHits) {
                Array.from(listRef.value.children).forEach((item: any, index) => {
                    if (props.searchEntry.subHits) {
                        const subHit = props.searchEntry.subHits[index];
                        if ((subHit.start) <= props.currentPlayingTime && (subHit.end) >= props.currentPlayingTime) {
                            scrollIntoView(item, {
                                behavior: 'smooth',
                                boundary: item.parentNode.parentNode
                            });
                        }
                    }
                });
            }
        },
        { deep: true } // It’s crucial to include { deep: true } if you want to watch nested properties inside an object/array
    );
}

// Set isMounted to true after the component has been mounted
onMounted(() => {
    setupWatcher(); // set up watcher if subsActivated is true
});

onUnmounted(() => {
    if (stopWatch) {
        stopWatch();
    }
});
</script> 

<style scoped>
.toggleDeepStyling:deep(.initialHightlight) {
    @apply text-red-400;
}
</style>