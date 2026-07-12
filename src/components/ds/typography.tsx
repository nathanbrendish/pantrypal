import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label" | "div";
};

function makeText(defaultClass: string, defaultAs: TextProps["as"] = "p") {
  return function Text({
    as,
    className,
    ...props
  }: TextProps) {
    const Tag = as ?? defaultAs;
    return <Tag className={cn(defaultClass, className)} {...props} />;
  };
}

export const Display = makeText(ds.display, "h1");
export const Heading1 = makeText(ds.h1, "h1");
export const Heading2 = makeText(ds.h2, "h2");
export const Heading3 = makeText(ds.h3, "h3");
export const SectionTitle = makeText(ds.sectionTitle, "h2");
export const BodyLarge = makeText(ds.bodyLg, "p");
export const Body = makeText(ds.body, "p");
export const Small = makeText(ds.small, "p");
export const Caption = makeText(ds.caption, "span");
export const TextLabel = makeText(ds.label, "label");
