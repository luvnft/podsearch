<template>
    <div class="flex w-9 h-9 items-center justify-center">
            <svg-icon name="subtitlesOn" class="h-[18px] fill-gray-400" v-if="props.activated" />
            <svg-icon name="subtitlesOff" class="h-[18px] scale-110 fill-gray-400 group-hover:text-gray-500" v-if="!props.activated" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    activated: boolean;
}>();

const emit = defineEmits<{
    (e: "subSyncTrigger", subSyncTrigger: boolean): void;
}>();

const subSyncTrigger = () => {
    console.log(231)
    emit("subSyncTrigger", !props.activated)
}
</script>