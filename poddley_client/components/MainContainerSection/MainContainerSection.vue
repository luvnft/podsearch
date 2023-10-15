<template>
    <main class="xs:px-0 xs:py-0 bg-white min-h-screen sm:py-1 px-0.5" v-if="mounted">
        <div class="container-fluid max-w-screen px-0.5 py-1">
            <slot />
        </div>
    </main>
</template>

<script setup lang = "ts">

const mounted: Ref<boolean> = ref(false);

onMounted(() => {
    mounted.value = true;
});

</script>