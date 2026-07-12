type SectionHeaderProps = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
