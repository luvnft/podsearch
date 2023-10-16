<template>
    <img :src="prepareImageLink(imageUrl)" :height="height" :width="width" loading="lazy" />
</template>

<script lang="ts" setup>
const { height, width, imageUrl } = defineProps<{
    height: string;
    width: string;
    imageUrl: string;
}>();
const prepareImageLink = (url) => `https://imagedelivery.net/lIUoO1zdA8rhNVUlNWC26w/${imageUrl}/w=${width}`;
</script>
