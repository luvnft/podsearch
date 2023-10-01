<template>
    <ul ref="listRef">
        <li class="m-0 p-0" v-for="(subHit, index) in props.searchEntry.subHits"
            :class="`${(subHit.start <= props.currentPlayingTime + 0.2 && subHit.end >= props.currentPlayingTime  + 0.2) ? 'highlight' : ''}`">
            <div v-html="utils.convertHitToFormattedText(subHit as unknown as Hit)" />
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { Hit } from '../../types/SearchResponse';


const listRef: Ref<any> = ref(null);
const utils: Utils = useUtils();

const props = defineProps<{
    searchEntry: Hit;
    index: number;
    currentPlayingTime: number;
}>();

watchEffect(() => {
    if (listRef.value) {
        Array.from(listRef.value.children).forEach((item: any, index) => {
            if (props.searchEntry.subHits) {
                const subHit = props.searchEntry.subHits[index];
                if (subHit.start <= props.currentPlayingTime + 0.2 && subHit.end >= props.currentPlayingTime  + 0.2) {
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
});
</script>
