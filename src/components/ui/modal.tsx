"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { CloseIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/ui/icons";
import type { ModalAction } from "@/types/ui";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Zero, one or many. The parent owns every callback. */
  actions?: ModalAction[];
  /** Blocks Escape, overlay click and the close button. */
  preventClose?: boolean;
  showCloseButton?: boolean;
};

const EXIT_MS = 150;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  preventClose = false,
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // Keep mounted during exit animation
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  const requestClose = useCallback(() => {
    if (!preventClose) onOpenChange(false);
  }, [preventClose, onOpenChange]);

  // Scroll lock + focus management
  useEffect(() => {
    if (!open || !mounted) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, mounted]);

  if (!mounted || typeof document === "undefined") return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      requestClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    );
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const state = open ? "open" : "closed";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      onKeyDown={onKeyDown}
    >
      <div
        data-state={state}
        aria-hidden="true"
        className="modal-overlay absolute inset-0 bg-foreground/40 backdrop-blur-xs"
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-state={state}
        className="modal-panel relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-lg border border-border bg-card text-card-foreground shadow-xl outline-none"
      >
        {(title || description || (showCloseButton && !preventClose)) && (
          <div className="flex items-start gap-4 p-5 pb-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-section-title font-semibold">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-secondary mt-1 text-sm">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && !preventClose && (
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 size-9"
                aria-label="Close dialog"
                onClick={requestClose}
              >
                <CloseIcon />
              </Button>
            )}
          </div>
        )}

        {children && (
          <div className="text-body min-h-0 flex-1 overflow-y-auto p-5">
            {children}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="flex flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end border-t border-border mt-2">
            {actions.map((a, i) => (
              <Button
                key={i}
                variant={a.variant ?? "primary"}
                loading={a.loading}
                disabled={a.disabled}
                onClick={a.onClick}
                className="max-sm:w-full"
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Convenience Confirmation Dialog for destructive operations (Yes / No)
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  message,
  confirmLabel = "Yes, delete",
  cancelLabel = "No, cancel",
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      actions={[
        {
          label: cancelLabel,
          variant: "secondary",
          onClick: () => onOpenChange(false),
          disabled: loading,
        },
        {
          label: confirmLabel,
          variant: "destructive",
          onClick: onConfirm,
          loading,
        },
      ]}
    >
      <div className="flex items-start gap-3 py-2">
        <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
          <AlertCircleIcon className="size-5" />
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}

/**
 * Convenience Success Dialog for operations with OK button
 */
export function SuccessDialog({
  open,
  onOpenChange,
  title = "Success",
  message,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  onConfirm?: () => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      actions={[
        {
          label: "OK",
          variant: "primary",
          onClick: () => {
            onOpenChange(false);
            onConfirm?.();
          },
        },
      ]}
    >
      <div className="flex items-start gap-3 py-2">
        <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
          <CheckCircleIcon className="size-5" />
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
