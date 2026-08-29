"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One "Add to calendar" button that pops up a choice of Google Calendar,
 * Outlook.com, or Apple/other (.ics download) — instead of three separate
 * buttons competing for space on every schedule row.
 */
export function AddToCalendarButton({
  googleUrl,
  outlookUrl,
  icsUrl,
}: {
  googleUrl: string;
  outlookUrl: string;
  icsUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        Add to calendar
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            Google Calendar
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            Outlook.com
          </a>
          <a
            href={icsUrl}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Apple / other (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
