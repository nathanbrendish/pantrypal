import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/cn";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "wide";
};

export function PageShell({
  children,
  className,
  maxWidth = "default",
}: PageShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10",
          maxWidth === "default" ? "max-w-5xl" : "max-w-6xl",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
