import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800"
          : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/20 dark:border-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/30",
        className
      )}
      {...props}
    />
  );
});
