import * as React from "react";
import { toast as sonnerToast, ExternalToast } from "sonner";

// This type defines the props our adapter `toast` function will accept,
// mirroring the old system's options for easier migration.
type OldToastProps = {
  id?: string; // Sonner toast functions can take an id for updating
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: ExternalToast["action"];
};

const SUCCESS_KEYWORDS = new Set([
  "success",
  "added",
  "updated",
  "deleted",
  "copied",
  "processed",
  "selected",
  "removed",
  "synced",
]);

function toast(props: OldToastProps) {
  const { title, description, variant, action, ...rest } = props;

  // Sonner's primary message is the first argument.
  // If title exists, use it as main message. Otherwise, use description.
  const message = title || description || "Notification";

  const sonnerOptions: ExternalToast = {
    // If both title and description are provided, and title is used as main message,
    // then description becomes Sonner's description.
    // If only description was provided (and used as main message), then Sonner's description is undefined.
    description: title && description ? description : undefined,
    action,
    ...rest,
  };

  let toastId: string | number | undefined;

  if (variant === "destructive") {
    toastId = sonnerToast.error(message, sonnerOptions);
  } else {
    // Heuristic to determine if it's a success toast based on title
    // For "default" variant or when no variant is specified.
    const titleString = typeof title === "string" ? title.toLowerCase() : "";
    const isSuccess = [...SUCCESS_KEYWORDS].some((keyword) =>
      titleString.includes(keyword),
    );

    if (isSuccess) {
      toastId = sonnerToast.success(message, sonnerOptions);
    } else {
      // Default Sonner toast for general messages
      toastId = sonnerToast(message, sonnerOptions);
    }
  }

  return {
    id: toastId,
    dismiss: () => {
      if (toastId !== undefined) {
        sonnerToast.dismiss(toastId);
      }
    },
    // update function is not implemented as it was not used in the codebase
    // and Sonner's update mechanism is `sonnerToast(newContent, { id: toastId, ... })`
  };
}

// The useToast hook now provides the adapted toast function and a global dismiss.
// The `toasts` array is no longer part of this hook as Sonner manages its own state.
function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId !== undefined) {
        sonnerToast.dismiss(toastId);
      } else {
        // Dismiss all toasts if no ID is provided
        sonnerToast.dismiss();
      }
    },
  };
}

export type { OldToastProps as ToastOptions }; // Exporting for compatibility if needed, though direct use is unlikely now
export { useToast, toast };
