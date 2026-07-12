import { ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  { step: 1, title: "Upload receipt" },
  { step: 2, title: "AI extracts ingredients" },
  { step: 3, title: "Review ingredients" },
  { step: 4, title: "Save to Pantry" },
] as const;

export function WorkflowSteps() {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((item, index) => (
        <div key={item.step} className="flex flex-col items-center gap-4">
          <Card className="w-full p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {item.step}
              </span>
              <p className="font-medium text-foreground">{item.title}</p>
            </div>
          </Card>
          {index < steps.length - 1 && (
            <ArrowDown
              className="h-5 w-5 text-muted"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}
