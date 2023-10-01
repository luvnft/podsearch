<template>
    <ul>
        <li class="m-0 p-0" v-for="(subHit, index) in props.searchEntry.subHits">
            <div v-html="utils.convertHitToFormattedText(subHit as unknown as Hit)" />
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { Hit } from '../../types/SearchResponse';
const utils: Utils = useUtils();

const props = defineProps<{
    searchEntry: Hit;
    index: number;
}>();
</script>



<style></style>
