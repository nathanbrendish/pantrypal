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
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium text-zinc-500 dark:text-zinc-400">
        {getGreeting()} 👋
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
      </h1>
      <p className="text-base text-zinc-500 dark:text-zinc-400">
        What would you like to do today?
      </p>
    </div>
  );
}

export function getFirstName(
  metadata: Record<string, unknown> | undefined
): string | null {
  if (!metadata) return null;

  if (typeof metadata.first_name === "string" && metadata.first_name.trim()) {
    return metadata.first_name.trim();
  }

  if (typeof metadata.full_name === "string" && metadata.full_name.trim()) {
    return metadata.full_name.trim().split(" ")[0] ?? null;
  }

  if (typeof metadata.name === "string" && metadata.name.trim()) {
    return metadata.name.trim().split(" ")[0] ?? null;
  }

  return null;
}
