<template>
    <div aria-live="assertive" :class="`animatecss animatecss-faster ${!props.toast.removing ? 'animatecss-slideInRight' : 'animatecss-fadeOut'
        } pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 py-6 sm:items-start sm:p-6`"
        v-if="show">
        <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
            <div
                class="bg-white ring-black pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-opacity-5">
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <CheckCircleIcon v-if="props.toast.type === 'success'" class="text-green-500 h-6 w-6"
                                aria-hidden="true" />
                            <ExclamationCircleIcon v-if="props.toast.type === 'error'" class="text-red-500 h-6 w-6"
                                aria-hidden="true" />
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                            <p class="text-gray-900 text-sm font-medium">{{ props.toast.message }}</p>
                        </div>
                        <div class="ml-4 flex flex-shrink-0">
                            <button type="button" @click="show = false"
                                class="text-gray-400 bg-white inline-flex rounded-md hover:text-gray-500 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2">
                                <span class="sr-only">Close</span>
                                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import { XMarkIcon } from "@heroicons/vue/20/solid";
import { Toast } from "../../utils/toastService/useToast";
const props = defineProps<{
    toast: Toast;
}>();

const show: Ref<boolean> = ref(true);
</script>
