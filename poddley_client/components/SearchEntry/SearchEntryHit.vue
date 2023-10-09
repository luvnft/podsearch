<template>
    <div ref="listRef" class="relative">
        <div class="m-0 p-0 cursor text-start" v-for="(subHit, index) in props.searchEntry.subHits"
            :id="`${subHit.id}-${subHit.start}`"
            :class="`${(((subHit.start <= props.currentPlayingTime) && (subHit.end >= props.currentPlayingTime)) && (props.currentPlayingTime > 0.3)) ? 'highlight' : props.currentPlayingTime < 0.1 ? 'toggleDeepStyling' : ''}`">
            <UseElementVisibility as="button" @click="goToAudioTime(subHit.start)" class="text-start"
                v-slot="{ isVisible }">
                <div v-if="isVisible" v-html="utils.convertSegmentHitToFormattedText(subHit)" />
            </UseElementVisibility>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ClientSearchResponseHit } from '../../types/ClientSearchResponse';
import scrollIntoView from 'scroll-into-view-if-needed';
import { UseElementVisibility } from '@vueuse/components'
const emit = defineEmits<{
    (e: "goToAudioTime", number: number): void;
}>();

const listRef: Ref<any> = ref(null);
const utils: Utils = useUtils();
const props = defineProps<{
    searchEntry: ClientSearchResponseHit;
    currentPlayingTime: number;
    subtitlesActivated: Ref<boolean>;
}>();

// Define a flag to determine whether the component has just mounted
const isMounted: Ref<boolean> = ref(false);

const goToAudioTime = (moveToTime: number) => {
    emit("goToAudioTime", moveToTime)
}

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
                        if (subHit.start <= props.currentPlayingTime && subHit.end >= props.currentPlayingTime) {
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

onUnmounted(() => {
    if (stopWatch) {
        stopWatch();
    }
});

// Set isMounted to true after the component has been mounted
onMounted(() => {
    isMounted.value = true;

    setupWatcher(); // set up watcher if subsActivated is true
});
</script> 

<style scoped>
.toggleDeepStyling:deep(.initialHightlight) {
    @apply text-red-400;
}
</style>