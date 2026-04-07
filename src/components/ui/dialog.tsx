"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        className={cn(
          "relative z-10 w-full max-w-md",
          "bg-neutral-900/95 backdrop-blur-[15px]",
          "border border-white/[0.12] rounded-2xl p-6",
          "shadow-[0_16px_48px_rgba(0,0,0,0.6)]",
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-5">
            <div className="flex items-start justify-between gap-4">
              {title && (
                <h2 id="dialog-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-xl p-1 hover:bg-white/[0.08]"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end gap-3 mt-6", className)} {...props}>
      {children}
    </div>
  );
}

export { Dialog, DialogFooter };
export type { DialogProps };
