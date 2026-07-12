import { SectionTitle, Small } from "@/components/ds/typography";

type SectionHeaderProps = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-[var(--ds-space-xs)]">
      <SectionTitle as="h2">{title}</SectionTitle>
      {description && (
        <Small className="leading-[var(--ds-leading-relaxed)]">
          {description}
        </Small>
      )}
    </div>
  );
}
