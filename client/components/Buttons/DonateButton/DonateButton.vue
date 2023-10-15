<template>
    <GenericLink
        class="hover:bg-gray-transparent group flex h-10 w-10 items-center justify-center rounded-md p-0 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-inset"
        :link="donateLink">
        <div class="flex h-10 w-10 items-center justify-center">
            <span class="sr-only">Donate button</span>
            <svg-icon name="donate"
                class="block h-full w-10 scale-[0.55] dark:fill-gray-500 fill-gray-400 group-hover:fill-gray-500 dark:group-hover:fill-gray-400"
                aria-hidden="true" />
        </div>
    </GenericLink>
</template>

<script setup lang="ts">
const donateLink: Ref<string> = ref("https://www.buymeacoffee.com/poddley");
</script>
