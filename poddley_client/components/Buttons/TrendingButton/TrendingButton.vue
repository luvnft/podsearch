<template>
    <NuxtLink type="button" :class="`items-center font-medium group flex justify-center rounded-md border border-gray-200  ${$route.name !== route ? 'bg-gray-50' : 'border-gray-400 bg-gray-100'
        } fill-gray-400 p-2 text-gray-400 no-underline shadow hover:bg-gray-100 active:shadow-sm`" :to="route">
        <span class="text-center text-gray-500 group-hover:text-gray-600 group-active:text-gray-600"
            v-if="!props.loading">Trending podcasts</span>
        <svg-icon name="spinner" class="h-6 w-6 text-gray-400" v-if="props.loading" />
    </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
    loading: boolean;
    route: string;
}>();
</script>
