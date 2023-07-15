<template>
  <div class="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-h-full tw-scale-110 tw-items-center tw-pl-2 tw-pr-0 sm:tw-static sm:tw-inset-auto sm:tw-ml-6 sm:tw-pr-0">
    <UserDropdown :user="user" @logout="logout" />
  </div>
</template>

<script>
export default {
  name: "ProfileMenu",
  props: ["user"],
  methods: {
    logout() {
      this.$emit("logout");
    },
  },
};
</script>
