import { useLayoutEffect } from "react";
import type { RefObject } from "react";

const DURATION_MS = 300;

export function useDialogAnimation(
  dialogRef: RefObject<HTMLElement>,
  contentWrapperRef: RefObject<HTMLElement>,
  isMaximized: boolean,
) {
  useLayoutEffect(() => {
    const dialogNode = dialogRef.current;
    const contentWrapperNode = contentWrapperRef.current;
    if (!dialogNode || !contentWrapperNode) return;

    const transition = `all ${DURATION_MS}ms ease-in-out`;

    const onTransitionEnd = () => {
      if (!isMaximized) {
        dialogNode.style.height = "auto";
      }
      dialogNode.removeEventListener("transitionend", onTransitionEnd);
    };

    if (isMaximized) {
      const { width, height } = dialogNode.getBoundingClientRect();
      dialogNode.style.width = `${width}px`;
      dialogNode.style.height = `${height}px`;
      dialogNode.style.transition = "none";

      requestAnimationFrame(() => {
        dialogNode.style.transition = transition;
        dialogNode.style.width = "95vw";
        dialogNode.style.height = "95vh";
      });
    } else {
      const contentHeight = contentWrapperNode.scrollHeight;
      dialogNode.style.height = `${contentHeight}px`;
      dialogNode.style.width = "";
    }

    dialogNode.addEventListener("transitionend", onTransitionEnd);

    return () => {
      dialogNode.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [isMaximized, dialogRef, contentWrapperRef]);
}
