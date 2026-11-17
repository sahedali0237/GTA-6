"use client";

import { CONFIG } from "@/lib/config";

export function SuggestedChips({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Suggested questions">
      {CONFIG.SUGGESTED_QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSend(question)}
          className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs text-muted transition-colors hover:border-accent-from hover:text-text disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
