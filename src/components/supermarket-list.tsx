const SUPERMARKETS = [
  "Tesco",
  "Asda",
  "Aldi",
  "Lidl",
  "Sainsbury's",
  "Morrisons",
] as const;

type SupermarketListProps = {
  title?: string;
  className?: string;
};

export function SupermarketList({
  title = "Supported supermarkets",
  className,
}: SupermarketListProps) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUPERMARKETS.map((name) => (
          <span
            key={name}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
