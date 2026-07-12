function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

type DashboardGreetingProps = {
  firstName?: string | null;
};

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {getGreeting()}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      </h1>
      <p className="text-base text-slate-500 dark:text-slate-400">
        Here&apos;s what&apos;s happening in your kitchen today.
      </p>
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
