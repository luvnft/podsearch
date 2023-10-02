<template>
    <div class="flex w-9 h-9 items-center justify-center">
        <ButtonsGenericButton @click="subSyncTrigger"
            class="bg-gray-0 group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex w-9 h-9 items-center justify-center rounded-lg border fill-neutral-400 p-0 px-2 font-medium no-underline shadow-sm hover:bg-neutral-100 focus:ring-gray-100 focus:ring-offset-gray-100 dark:ring-neutral-500 focus:outline-none focus:ring-2 active:shadow-sm">
            <svg-icon name="subtitlesOn" class="h-[18px] fill-gray-400" v-if="props.activated" />
            <svg-icon name="subtitlesOff" class="h-[18px] scale-110 fill-gray-400 group-hover:text-gray-500"
                v-if="!props.activated" />
        </ButtonsGenericButton>
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