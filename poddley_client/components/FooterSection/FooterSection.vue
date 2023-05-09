<template>
  <footer class="text-center tw-absolute tw-bottom-0 tw-h-20 flex items-center tw-w-full">
    <div class="tw-p-0 tw-h-full tw-w-full m-0">
      <ul class="flex items-center tw-h-full tw-w-full p-0 m-0">
        <li v-for="item in navigation" class="list-inline-item" :key="item.name" :href="item.href">
          <NuxtLink class="link-secondary" href="#">
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script lang = "ts" setup>
import ContactIcon from "@/components/Icons/ContactIcon.vue";
import DonateIcon from "@/components/Icons/DonateIcon.vue";

const navigation = [
  {
    name: "Contact",
    href: "mailto:luka_momcilovic@hotmail.com",
    icon: ContactIcon,
  },
  {
    name: "Donate",
    href: "https://www.buymeacoffee.com/lukamomci",
    icon: DonateIcon,
  },
];
</script>
