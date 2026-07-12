"use client";

import { Search, X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void;
  sticky?: boolean;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    { className, value, onClear, sticky = false, ...props },
    ref
  ) {
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div
        className={cn(
          "relative",
          sticky && "sticky top-[4.5rem] z-40 -mx-1 px-1 py-3 backdrop-blur-md"
        )}
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            "pp-focus-ring h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-12 pr-12 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="pp-focus-ring absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
