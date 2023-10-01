<template>
    <ul ref="listRef" class="relative">
        <li class="m-0 p-0 cursor" v-for="(subHit, index) in props.searchEntry.subHits"
            :class="`${(subHit.start <= props.currentPlayingTime + 0.2 && subHit.end >= props.currentPlayingTime + 0.2) ? 'highlight' : ''}`">
            <button @click="goToAudioTime(subHit.start)">
                <div v-html="utils.convertSegmentHitToFormattedText(subHit)" />
            </button>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { Hit } from '../../types/SearchResponse';

const emit = defineEmits<{
    (e: "goToAudioTime", number: number): void;
}>();

const listRef: Ref<any> = ref(null);
const utils: Utils = useUtils();

const props = defineProps<{
    searchEntry: Hit;
    currentPlayingTime: number;
}>();
// Define a flag to determine whether the component has just mounted
const isMounted: Ref<boolean> = ref(false);

const goToAudioTime = (moveToTime: number) => {
    console.log("yolo")
    emit("goToAudioTime", moveToTime)
}
watch(
    // watch accepts the source data that you want to observe.
    () => [props.currentPlayingTime, props.searchEntry.subHits],
    () => {
        if (listRef.value && props.searchEntry.subHits) {
            Array.from(listRef.value.children).forEach((item: any, index) => {
                if (props.searchEntry.subHits) {
                    const subHit = props.searchEntry.subHits[index];
                    if (subHit.start <= props.currentPlayingTime + 0.2 && subHit.end >= props.currentPlayingTime + 0.2) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }
            });
        }
    },
    { deep: true } // It’s crucial to include { deep: true } if you want to watch nested properties inside an object/array
);

// Set isMounted to true after the component has been mounted
onMounted(() => {
    isMounted.value = true;
});
</script> 