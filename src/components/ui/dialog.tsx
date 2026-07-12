"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Heading3, Small } from "@/components/ds/typography";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "fixed inset-0 z-[var(--ds-z-modal)] m-auto w-[calc(100%-2rem)] max-w-lg rounded-[var(--ds-radius-xl)] border border-border bg-card p-0 shadow-xl backdrop:bg-overlay",
        className
      )}
    >
      <div className="flex items-start justify-between gap-[var(--ds-space-lg)] border-b border-border px-[var(--ds-space-xl)] py-[var(--ds-space-xl)]">
        <div>
          <Heading3 as="h2">{title}</Heading3>
          {description && (
            <Small className="mt-[var(--ds-space-xs)]">{description}</Small>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-[var(--ds-space-xl)] py-[var(--ds-space-xl)]">
        {children}
      </div>
    </dialog>
  );
}

export function ConfirmationDialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      {children}
    </Dialog>
  );
}
