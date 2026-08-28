"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Polls the server for fresh data on an interval — used on the TV kiosk routes so scores posted by the coach show up without anyone touching the screen. */
export function AutoRefresh({ intervalSeconds = 20 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
