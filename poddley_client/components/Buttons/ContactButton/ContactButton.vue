<template>
    <a :href="`mailto:${contactEmail}`"
        class="group flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 fill-gray-400 p-2 font-medium shadow hover:bg-gray-100 active:shadow-sm">
        <ButtonsGenericButton title="contactButton">
            <svg-icon name="contact" class="h-6 w-6 scale-90 text-gray-400 group-hover:fill-gray-500" aria-hidden="true" />
        </ButtonsGenericButton>
    </a>
</template>

<script lang="ts" setup>
const contactEmail = "luka_momcilovic@hotmail.com";
</script>
