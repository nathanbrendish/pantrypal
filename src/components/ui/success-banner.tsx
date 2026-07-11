type SuccessBannerProps = {
  message: string;
};

export function SuccessBanner({ message }: SuccessBannerProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300"
    >
      {message}
    </div>
  );
}
