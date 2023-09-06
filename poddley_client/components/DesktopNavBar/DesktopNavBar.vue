<template>
  <div class="border-gray-200 h-full w-full border-b">
    <div class="flex h-full w-full items-center justify-between gap-x-0">
      <!-- Linker -->
      <div class="col-5 m-0 flex h-full items-center md:gap-x-5 px-0 gap-x-2">
        <GenericLink v-for="page in navigation" :link="page.href" class="text-gray-500 m-0 flex items-center justify-center font-normal text-center text-base hover:text-gray-600">
          {{ page.name }}
        </GenericLink>
      </div>
      <!-- Logo -->
      <div class="col-2 flex justify-center">
        <NavTitle />
      </div>
      <div class="col-5 flex h-full flex-1 items-center justify-end gap-x-1.5">
        <!-- Search -->
        <!-- <div class="flex h-full items-center justify-center">
          <SearchBox class="text-gray-400 flex-shrink-0 group-hover:text-gray-500" aria-hidden="true" :open-search-section="void" />
        </div> -->

        <!-- Account -->
        <!-- <div class="flex h-full items-center justify-center">
          <ButtonsMicrophoneButton class="text-gray-400 flex-shrink-0 group-hover:text-gray-500" aria-hidden="true" />
        </div> -->

        <!-- DonateButton -->
        <!-- <ButtonsDonateButton aria-hidden="true" /> -->

        <!-- Cart -->
        <ButtonsDarkModeButton aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { name: "Home", href: "/", current: true, external: false },
  { name: "About", href: "about", current: false, external: false },
  { name: "Contact", href: "/contact", current: false, external: false },
];
import { ref } from "vue";
import { Dialog, DialogPanel, Popover, PopoverButton, PopoverGroup, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import MicrophoneButton from "components/Buttons/MicrophoneButton/MicrophoneButton.vue";

const orders = [
  {
    id: 1,
    date: "July 12, 2021",
    datetime: "2021-07-12",
    status: "out-for-delivery",
    productName: "Kicks Carrier",
    href: "#",
    imageSrc: "https://tailwindui.com/img/ecommerce-images/order-history-page-05-product-01.jpg",
    imageAlt: "Black fabric shoe bag with zipper around 3 sides, holding pair of white sneakers.",
  },
  {
    id: 2,
    date: "June 21, 2021",
    datetime: "2021-06-21",
    status: "delivered",
    productName: "Micro Backpack",
    href: "#",
    imageSrc: "https://tailwindui.com/img/ecommerce-images/order-history-page-05-product-02.jpg",
    imageAlt: "Light grey canvas backpack with black handle, zipper, and edge details.",
  },
  {
    id: 3,
    date: "June 6, 2021",
    datetime: "2021-06-06",
    status: "cancelled",
    productName: "Drawtop Canister",
    href: "#",
    imageSrc: "https://tailwindui.com/img/ecommerce-images/order-history-page-05-product-03.jpg",
    imageAlt: "Orange canvas cylindrical bag with drawstring top, front zipper pouch, and black shoulder strap.",
  },
  {
    id: 4,
    date: "May 24, 2021",
    datetime: "2021-05-24",
    status: "delivered",
    productName: "High Wall Tote",
    href: "#",
    imageSrc: "https://tailwindui.com/img/ecommerce-images/order-history-page-05-product-04.jpg",
    imageAlt: "White canvas tote bag with black drawstring liner and white handle.",
  },
  // More orders...
];
const footerNavigation = {
  products: [
    { name: "Bags", href: "#" },
    { name: "Tees", href: "#" },
    { name: "Objects", href: "#" },
    { name: "Home Goods", href: "#" },
    { name: "Accessories", href: "#" },
  ],
  company: [
    { name: "Who we are", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Press", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Terms & Conditions", href: "#" },
    { name: "Privacy", href: "#" },
  ],
  customerService: [
    { name: "Contact", href: "#" },
    { name: "Shipping", href: "#" },
    { name: "Returns", href: "#" },
    { name: "Warranty", href: "#" },
    { name: "Secure Payments", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Find a store", href: "#" },
  ],
};

const open = ref(false);
</script>
