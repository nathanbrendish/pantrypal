import { Upload } from "lucide-react";

export function DragDropIllustration({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-8 py-10 dark:border-zinc-700 dark:bg-zinc-800/50 ${className ?? ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
        <Upload
          className="h-7 w-7 text-primary"
          aria-hidden="true"
        />
      </div>
      <p className="mt-4 text-sm font-medium text-muted">
        Drag & drop your receipt here
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        or click to browse files
      </p>
    </div>
  );
}
