<template>
    <div class="spinner animate-spin h-6 w-6 rounded-full"></div>
</template>

<style scoped>
.spinner {
    background: radial-gradient(farthest-side, theme(colors.gray.500) 100%, theme(colors.gray.500)) top/3.8px 3.8px no-repeat, conic-gradient(#0000 10%, theme(colors.gray.500));
    -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 3.8px), theme(colors.gray.500) 0);
}
</style>