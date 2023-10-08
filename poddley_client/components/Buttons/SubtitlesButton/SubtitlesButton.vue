<template>
    <div class="h-9 w-9">
        <ButtonsGenericButton @click="subSyncTrigger"
            name="subtitlesSyncButton"
            class="bg-gray-0 group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex w-9 h-9 items-center justify-center rounded-lg border fill-neutral-400 p-0 font-medium no-underline shadow-sm hover:bg-neutral-100 focus:ring-gray-100 focus:ring-offset-gray-100 dark:ring-neutral-500 focus:outline-none focus:ring-2 active:shadow-sm">

            <div class="flex aspect-square h-9 w-9 items-center justify-center">
                <div :class="`h-9 w-9 items-center justify-center ${props.activated ? 'flex' : 'hidden'}`">
                    <svg-icon name="subtitlesOn"
                        class="flex h-full w-3/5 justify-center fill-gray-400 group-hover:fill-gray-500 dark:fill-gray-500 dark:group-hover:fill-gray-400"
                        aria-hidden="true" />
                </div>
                <div :class="`h-9 w-9 items-center justify-center ${!props.activated ? 'flex' : 'hidden'}`">
                    <svg-icon name="subtitlesOff"
                        class="flex h-full w-3/5 scale-110 justify-center fill-gray-400 group-hover:fill-gray-500"
                        aria-hidden="true" />
                </div>
            </div>
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
    emit("subSyncTrigger", !props.activated)
}
</script>