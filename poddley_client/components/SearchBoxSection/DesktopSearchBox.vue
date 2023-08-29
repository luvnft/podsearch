<template>
    <!-- Desktop Search Bar-->
    <div class="mx-auto flex-col gap-y-2 py-3 sm:flex sm:pb-5 md:px-3">
        <form class="flex items-center">
            <label for="voice-search" class="sr-only">Search</label>
            <div class="relative w-full">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon class="text-gray-500 h-4 w-4" />
                </div>
                <input :autofocus="props.autofocus" type="text" id="voice-search" class="text-gray-900 bg-gray-100 border-gray-200 block w-full rounded-lg border p-2.5 pl-10 text-base focus:border-gray-500 focus:ring-gray-500" placeholder="Search for podcasts, episodes and quotes from podcasts" required />
                <button type="button" class="group absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="text-gray-500 h-4 w-4 group-hover:text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7v3a5.006 5.006 0 0 1-5 5H6a5.006 5.006 0 0 1-5-5V7m7 9v3m-3 0h6M7 1h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z" />
                    </svg>
                </button>
            </div>
            <button type="submit" class="text-neutral-500 bg-gray-100 border-gray-200 ml-2 inline-flex items-center rounded-lg border px-3 py-2.5 text-base font-medium hover:text-neutral-600 hover:bg-gray-100 focus:ring-gray-300 focus:outline-none focus:ring-4">
                <svg class="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
                Search
            </button>
        </form>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    autofocus: boolean;
}>();
</script>
