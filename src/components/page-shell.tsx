import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "wide";
  withNavbar?: boolean;
};

/** App content page shell with optional navbar. */
export function PageContainer({
  children,
  className,
  maxWidth = "default",
  withNavbar = true,
}: PageContainerProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {withNavbar && <Navbar />}
      <main
        className={cn(
          ds.pageContainer,
          ds.contentStack,
          "flex-1 py-[var(--ds-space-2xl)] sm:py-[var(--ds-space-3xl)]",
          maxWidth === "wide" && ds.pageContainerWide,
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}

/** @deprecated Prefer PageContainer */
export function PageShell(props: PageContainerProps) {
  return <PageContainer {...props} />;
}
