// useToast.ts
import { ref, provide } from "vue";

const toasts = ref([] as Toast[]);

interface Toast {
  id: number;
  message: string;
  type: string;
  timeout: number;
  removing?: boolean;
  animationTime?: number;
}

function showToast(message: string, type = "success", timeout: number = 3000, animationTime = 1000) {
  const toast: Toast = {
    id: Date.now(),
    message,
    type,
    timeout,
  };
  toasts.value.push(toast);

  setTimeout(() => {
    // Mark the toast as being removed, this allows for the transition to occur
    const index = toasts.value.findIndex((t) => t.id === toast.id);
    if (index !== -1) {
      toasts.value[index].removing = true;
    }

    // Delay the actual removal to allow the exit transition to complete
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== toast.id);
    }, animationTime);
  }, timeout);
}

function useToastProvider() {
  provide("showToast", showToast);
}

export { useToastProvider, toasts, showToast, Toast };
