export type GreetingPeriod = "morning" | "afternoon" | "evening" | "lateNight";

export type GreetingContent = {
  period: GreetingPeriod;
  headline: string;
  subheadline: string;
};

/**
 * Returns the time-of-day period for a given date using that date's local hours.
 * Pass `new Date()` in the browser to reflect the user's timezone.
 */
export function getGreetingPeriodForTime(date: Date): GreetingPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "evening";
  }

  return "lateNight";
}

/**
 * Builds polished greeting copy for the given local date and optional first name.
 */
export function getGreetingForTime(
  date: Date,
  firstName?: string | null
): GreetingContent {
  const period = getGreetingPeriodForTime(date);
  const name = firstName?.trim() || null;

  switch (period) {
    case "morning":
      return {
        period,
        headline: "Good morning",
        subheadline: name
          ? `Welcome back, ${name}. Here's what's happening in your kitchen today.`
          : "Welcome back. Here's what's happening in your kitchen today.",
      };
    case "afternoon":
      return {
        period,
        headline: "Good afternoon",
        subheadline: name
          ? `Ready to cook something delicious, ${name}?`
          : "Ready to cook something delicious?",
      };
    case "evening":
      return {
        period,
        headline: "Good evening",
        subheadline: name
          ? `Let's make dinner easy, ${name}.`
          : "Let's make dinner easy.",
      };
    case "lateNight":
      return {
        period,
        headline: "Working late?",
        subheadline: name
          ? `Let's see what you can make with what's in your pantry, ${name}.`
          : "Let's see what you can make with what's in your pantry.",
      };
  }
}

export function formatGreetingDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
