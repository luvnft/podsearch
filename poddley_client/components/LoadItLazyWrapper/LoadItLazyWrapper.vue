<template>
  <div ref="wrappedComponent">
    <div v-if="isVisible">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useElementVisibility } from "@vueuse/core";
const wrappedComponent: Ref<HTMLElement | null> = ref(null);
const isVisible = useElementVisibility(wrappedComponent);
console.log("IsVisible first: ", isVisible.value);

let unwatch = watch(isVisible, function (state) {
  if (wrappedComponent.value) {
    console.log("isVisible: ", isVisible.value);
    isVisible.value = true;
  }
  unwatch();
});
</script>

<style scoped>
.hideComponent {
  visibility: hidden;
  width: 0;
  height: 0;
}
</style>
