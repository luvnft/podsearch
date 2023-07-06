<template>
  <div class="tw-flex tw-w-full tw-rounded-md tw-border-none tw-h-10 tw-mb-2">
    <div class="tw-relative tw-flex tw-flex-grow tw-items-stretch tw-border-none tw-bg-transparent focus-within:tw-z-10">
      <!-- <div class="tw-pointer-events-none tw-absolute tw-inset-y-0 tw-left-0 tw-flex tw-items-center tw-pl-3" v-if="showSearchIcon && windowWidth > 440">
        <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" aria-hidden="true" />
      </div> -->
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search for a quote in a podcast"
        class="tw-block tw-w-full tw-justify-center tw-rounded-none tw-rounded-l-md tw-border-gray-300 tw-pl-0 tw-text-center tw-text-base focus:tw-border-indigo-500 focus:tw-ring-indigo-500"
        v-model="searchString"
        autofocus
      />
    </div>
    <!-- <button
      type="button"
      title="searchButton"
      class="10 tw-group tw-flex tw-w-12 tw-items-center tw-justify-center tw-rounded-r-md tw-border-l tw-border-solid tw-border-gray-300 tw-bg-gray-50 tw-p-2 tw-text-gray-700 tw-shadow-sm hover:tw-bg-gray-100 active:tw-shadow-none"
    >
      <IconsMagnifyingGlass class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="!loading" />
      <IconsSpinnerIcon class="tw-h-6 tw-w-6 tw-text-gray-400" v-if="loading" />
    </button> -->
  </div>
</template>

<script lang="ts" setup>
//Vars
const searchString: Ref<string> = ref("");
const showSearchIcon: Ref<boolean> = ref(false);
const windowWidth: Ref<number> = ref(0);
const loading: Ref<boolean> = ref(false);

function toggleSearchIcon(showvalue: boolean) {
  showSearchIcon.value = showvalue;
}

const updateWidth = () => {
  windowWidth.value = process.client ? window.innerWidth : 0;
  console.log(windowWidth.value);
};

//On Mounted
onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener("resize", updateWidth);
});

//Remove listener before unmounting
onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});
</script>
