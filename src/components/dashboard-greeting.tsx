import { Heading1, Small } from "@/components/ds/typography";
import { ds } from "@/lib/design-system";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type DashboardGreetingProps = {
  firstName?: string | null;
};

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  const greeting = getGreeting();
  const title = firstName
    ? `👋 ${greeting}, ${firstName}`
    : `👋 ${greeting}`;

  return (
    <div className={`${ds.fadeIn} flex flex-col gap-[var(--ds-space-sm)]`}>
      <Heading1 as="h1">{title}</Heading1>
      <Small className="text-[length:var(--ds-text-body)]">
        Ready to cook something delicious today?
      </Small>
      <Small className="font-medium text-muted">{formatToday()}</Small>
    </div>
  );
}

export function getDisplayName(
  metadata: Record<string, unknown> | undefined
): string | null {
  if (!metadata) return null;

  if (
    typeof metadata.display_name === "string" &&
    metadata.display_name.trim()
  ) {
    return metadata.display_name.trim();
  }

  if (typeof metadata.full_name === "string" && metadata.full_name.trim()) {
    return metadata.full_name.trim();
  }

  if (typeof metadata.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }

  return null;
}

export function getFirstName(
  metadata: Record<string, unknown> | undefined
): string | null {
  const displayName = getDisplayName(metadata);
  if (!displayName) return null;

  if (typeof metadata?.first_name === "string" && metadata.first_name.trim()) {
    return metadata.first_name.trim();
  }

  return displayName.split(" ")[0] ?? null;
}
