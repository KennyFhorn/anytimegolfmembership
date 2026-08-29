"use client";

import { cn } from "@/lib/utils";

/**
 * Closes the nearest ancestor <details> disclosure — the one bit of native
 * HTML can't do on its own (there's no way for a plain button to collapse a
 * <details> without JS), so this is the one deliberately client-side piece
 * of an otherwise all-server "Add a league night" form.
 */
export function CancelDetailsButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.currentTarget.closest("details")?.removeAttribute("open");
      }}
      className={cn(
        "inline-flex w-fit items-center justify-center gap-2 rounded-full border border-red-400/20 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-red-300 backdrop-blur-xl transition-all",
        "shadow-[0_16px_32px_-14px_rgba(0,0,0,0.7),0_8px_20px_-8px_var(--candy-red),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
        "hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-white/[0.08] active:translate-y-0",
        className,
      )}
    >
      {children}
    </button>
  );
}
