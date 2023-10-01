<template>
    <div class="flex w-9 h-9 items-center justify-center">
        <ButtonsGenericButton
            class="bg-gray-0 group text-gray-400 bg-neutral-100 border-neutral-300 ring-neutral-400 flex w-9 h-9 items-center justify-center rounded-lg border fill-neutral-400 p-0 px-2 font-medium no-underline shadow-sm hover:bg-neutral-100 focus:ring-gray-100 focus:ring-offset-gray-100 dark:ring-neutral-500 focus:outline-none focus:ring-2 active:shadow-sm">
            <PlayIcon v-if="!props.playing"
                class="h-full scale-105 w-full group-hover:fill-gray-500 dark:group-hover:fill-gray-300"
                aria-hidden="true" />
            <XMarkIcon v-else class="h-full scale-125 w-full group-hover:fill-gray-500 dark:group-hover:fill-gray-300"
                aria-hidden="true" />
        </ButtonsGenericButton>
    </div>
</template>

<script setup lang="ts">
import { PlayIcon, XMarkIcon } from "@heroicons/vue/20/solid";

const props = defineProps<{
    playing: boolean;
}>();
</script>
