"use client";

import { useSyncExternalStore } from "react";
import { Heading1, Small } from "@/components/ds/typography";
import { ds } from "@/lib/design-system";
import {
  formatGreetingDate,
  getGreetingForTime,
} from "@/lib/greeting";

type DashboardGreetingProps = {
  firstName?: string | null;
};

function subscribeToVisibility(onStoreChange: () => void) {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  document.addEventListener("visibilitychange", onStoreChange);
  return () => {
    document.removeEventListener("visibilitychange", onStoreChange);
  };
}

function getClientNow(): number {
  return Date.now();
}

function getServerNowSnapshot(): number {
  // Stable SSR snapshot — real local time is applied on the client.
  return 0;
}

/**
 * Client-side greeting that always uses the browser's local timezone.
 */
export function useGreeting(firstName?: string | null) {
  const nowMs = useSyncExternalStore(
    subscribeToVisibility,
    getClientNow,
    getServerNowSnapshot
  );

  const now = nowMs === 0 ? null : new Date(nowMs);

  if (!now) {
    return {
      headline: "Welcome back",
      subheadline: firstName
        ? `Welcome back, ${firstName}.`
        : "Welcome back.",
      dateLabel: null as string | null,
    };
  }

  const greeting = getGreetingForTime(now, firstName);

  return {
    headline: greeting.headline,
    subheadline: greeting.subheadline,
    dateLabel: formatGreetingDate(now),
  };
}

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  const { headline, subheadline, dateLabel } = useGreeting(firstName);

  return (
    <div className={`${ds.fadeIn} flex flex-col gap-[var(--ds-space-sm)]`}>
      <Heading1 as="h1" className="normal-case tracking-tight">
        {headline}
      </Heading1>
      <Small className="text-[length:var(--ds-text-body)] text-foreground">
        {subheadline}
      </Small>
      {dateLabel && (
        <Small className="font-medium text-muted">{dateLabel}</Small>
      )}
    </div>
  );
}
