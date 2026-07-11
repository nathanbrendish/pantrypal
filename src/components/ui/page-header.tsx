type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="text-3xl" aria-hidden="true">
            {icon}
          </span>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
      </div>
      {description && (
        <p className="max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
