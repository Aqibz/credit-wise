import type { ReactNode } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

type ToastTone = "success" | "error" | "warning" | "info";
type ToastPayload = { tone: ToastTone; title: string; body?: string };

type ToastApi = {
  show: (toast: ToastPayload) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  warning: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
};

function dispatchToast({ tone, title, body }: ToastPayload) {
  const options = body ? { description: body } : undefined;

  switch (tone) {
    case "success":
      toast.success(title, options);
      return;
    case "error":
      toast.error(title, options);
      return;
    case "warning":
      toast.warning(title, options);
      return;
    case "info":
    default:
      toast(title, options);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        toastOptions={{
          className: "font-medium",
          descriptionClassName: "text-muted-foreground",
        }}
      />
    </>
  );
}

export function useToast(): ToastApi {
  return {
    show: dispatchToast,
    success: (title, body) => dispatchToast({ tone: "success", title, body }),
    error: (title, body) => dispatchToast({ tone: "error", title, body }),
    warning: (title, body) => dispatchToast({ tone: "warning", title, body }),
    info: (title, body) => dispatchToast({ tone: "info", title, body }),
  };
}
