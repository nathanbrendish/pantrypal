import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          {icon && (
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl dark:bg-blue-950/50"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}
