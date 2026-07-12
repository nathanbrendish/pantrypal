"use client";

import { Search, X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

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
          sticky &&
            "sticky top-[4.5rem] z-[var(--ds-z-sticky)] -mx-1 px-1 py-[var(--ds-space-md)] backdrop-blur-md"
        )}
      >
        <Search
          className="pointer-events-none absolute left-[var(--ds-space-lg)] top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            ds.focusRing,
            "h-[var(--ds-height-control)] w-full rounded-[var(--ds-radius-xl)] border border-border bg-card/90 pl-12 pr-12 text-sm text-foreground shadow-sm placeholder:text-muted",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              ds.focusRing,
              "absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[var(--ds-radius-md)] text-muted hover:bg-background hover:text-foreground"
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
