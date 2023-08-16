<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10 h-full w-full" @close="open = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="bg-gray-800 fixed inset-0 bg-opacity-90 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0"
          >
            <DialogPanel class="bg-white relative transform overflow-hidden rounded-lg px-4 pb-4 pt-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="bg-blue-100 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <ChatBubbleBottomCenterTextIcon class="text-neutral-900 h-6 w-6" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-gray-900 text-lg font-medium leading-6">{{ props.podcastName }}</DialogTitle>
                  <div class="mt-2">
                    <p class="text-gray-500 text-sm">{{ props.podcastTest }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button
                  type="button"
                  class="text-white bg-indigo-600 inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm hover:bg-indigo-700 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm"
                  @click="() => (open = false)"
                >
                  Go back
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/vue/24/outline";
const open = ref(true);
const props = defineProps<{
  podcastTest: any;
  podcastName: string;
}>();
</script>
