import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "default" | "lg" | "icon";
};

const variants = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-600/30 dark:bg-blue-500 dark:hover:bg-blue-600",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  outline:
    "border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600/30 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300 dark:text-slate-300 dark:hover:bg-slate-800",
};

const sizes = {
  default: "h-11 px-5 text-sm",
  lg: "h-13 min-h-[3.25rem] px-6 text-base",
  icon: "h-11 w-11",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
