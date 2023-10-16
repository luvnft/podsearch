<template>
    <img :src="prepareImageLink(imageUrl)" :height="height" :width="width" loading="lazy" />
</template>

<script lang="ts" setup>
const { height, width, imageUrl } = defineProps<{
    height: string;
    width: string;
    imageUrl: string;
}>();

const prepareImageLink = (url) => `${process.env.CLOUDFLARE_IMAGE_BASE_URL}/${url}/w=${width},h=${height}`;
</script>
