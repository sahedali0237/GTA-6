"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Message } from "ai";

import { cn } from "@/lib/utils";

// NOTE: Only GFM rendering — never rehype-raw (spec §12: no raw HTML in chat).
const markdownComponents = {
  a: ({ node, ...props }: React.ComponentPropsWithoutRef<"a"> & { node?: unknown }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
  p: ({ node, ...props }: React.ComponentPropsWithoutRef<"p"> & { node?: unknown }) => (
    <p {...props} className="mb-2 last:mb-0" />
  ),
  ul: ({ node, ...props }: React.ComponentPropsWithoutRef<"ul"> & { node?: unknown }) => (
    <ul {...props} className="mb-2 list-disc pl-5 last:mb-0" />
  ),
  ol: ({ node, ...props }: React.ComponentPropsWithoutRef<"ol"> & { node?: unknown }) => (
    <ol {...props} className="mb-2 list-decimal pl-5 last:mb-0" />
  ),
  strong: ({ node, ...props }: React.ComponentPropsWithoutRef<"strong"> & { node?: unknown }) => (
    <strong {...props} className="font-semibold" />
  ),
};

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
          isUser
            ? "bg-accent-gradient font-medium text-[#0b0b0f]"
            : "border border-border bg-surface-2 text-text",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
