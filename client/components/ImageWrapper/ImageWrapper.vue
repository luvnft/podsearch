<template>
    <img :src="utils.prepareImageLink(props.imageUrl, props.width)" :width="props.width" loading="lazy" />
</template>

<script lang="ts" setup>
const props = defineProps<{
    width: number;
    imageUrl: string;
}>();
const utils: Utils = useUtils();
</script>
