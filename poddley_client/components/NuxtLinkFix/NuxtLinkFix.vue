<template>
  <a :href="to" @click="navigate">
    <slot />
  </a>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "CustomRouterLink",
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  setup() {
    const router = useRouter();

    function navigate(event) {
      event.preventDefault();
      router.push(this.to);
    }

    return { navigate };
  },
};
</script>
