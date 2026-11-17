"use client";

import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";
import { ArrowUp, Coffee, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { QuotaBadge } from "@/components/chat/QuotaBadge";
import { SuggestedChips } from "@/components/chat/SuggestedChips";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CONFIG } from "@/lib/config";
import { incrementQuota, isQuotaExhausted, remainingQuota } from "@/lib/quota";
import { cn } from "@/lib/utils";

const CHAT_STORAGE_KEY = "gta6_chat";

// NOTE: Exact user-facing messages from spec §5.6; no other error copy is used.
const MESSAGES = {
  dailyLimit: `You've used all ${CONFIG.DAILY_LIMIT} free questions for today. Come back tomorrow, or support the project to keep it running ☕`,
  perMinute: "Whoa, slow down! Please wait a moment before asking again.",
  upstream: "Oops, the AI is taking a break. Please try again in a moment.",
  offline: "You appear to be offline.",
  badRequest: "Something went wrong with that request. Please refresh and try again.",
} as const;

type ErrorCode = "limit" | "upstream" | "forbidden" | "bad_request";

/**
 * Map any error thrown by useChat/append to one of our known error codes.
 *
 * Sources in priority order:
 *  1. Our own API route JSON: { "error": "<code>" }
 *  2. AI SDK streaming errors (e.g. AI_APICallError, network failures)
 *     → these are always upstream problems, not client bugs
 *  3. Generic network errors (TypeError "Failed to fetch", etc.)
 */
function extractErrorCode(error: unknown): ErrorCode {
  const raw = error instanceof Error ? error.message : String(error);

  // 1. Try our own JSON payload first.
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (
      parsed.error === "limit" ||
      parsed.error === "upstream" ||
      parsed.error === "forbidden" ||
      parsed.error === "bad_request"
    ) {
      return parsed.error;
    }
  } catch {
    // Not a JSON error payload — continue.
  }

  // 2. AI SDK wraps upstream failures with class names or prefixes like
  //    "AI_APICallError", "AI_LoadAPIKeyError", "AI_NoObjectGeneratedError", etc.
  if (/AI_[A-Z]/i.test(raw)) return "upstream";

  // 3. Plain network / fetch errors (offline, CORS, timeout).
  if (
    /failed to fetch|networkerror|load failed|aborted|timeout/i.test(raw)
  ) {
    return "upstream";
  }

  // 4. HTTP status codes embedded in error strings (e.g. "429", "502", "503").
  if (/\b(429|502|503|504)\b/.test(raw)) return "upstream";
  if (/\b(400)\b/.test(raw)) return "bad_request";
  if (/\b(403)\b/.test(raw)) return "forbidden";

  // 5. Unknown — treat as upstream to avoid showing a confusing "bad request"
  //    message for what is almost always a server/API problem.
  return "upstream";
}

/**
 * NOTE: The AI SDK sends the full message list on every request. To honor the
 * "last 6 messages + the new one, max 7" context cap without depending on SDK
 * internals, we rewrite the request body in a custom fetch wrapper.
 */
function makeTrimmingFetch(): typeof fetch {
  return async (input, init) => {
    if (typeof init?.body === "string") {
      try {
        const body = JSON.parse(init.body) as { messages?: unknown[] };
        if (Array.isArray(body.messages)) {
          body.messages = body.messages.slice(-7);
          init = { ...init, body: JSON.stringify(body) };
        }
      } catch {
        // Body was not JSON — pass it through untouched.
      }
    }
    return fetch(input, init);
  };
}

// NOTE: ~4 lines at 14px font / 20px line-height + vertical padding.
const MAX_INPUT_HEIGHT = 96;

export function ChatWidget() {
  const trimmingFetch = useRef(makeTrimmingFetch());
  const hydratedRef = useRef(false);

  const [banner, setBanner] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(CONFIG.DAILY_LIMIT);
  const [isOffline, setIsOffline] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // NOTE: handleError must be defined before useChat so it can be passed as onError.
  const handleError = useCallback((error: unknown) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBanner(MESSAGES.offline);
      return;
    }
    const code = extractErrorCode(error);
    if (code === "limit") {
      setBanner(isQuotaExhausted() ? MESSAGES.dailyLimit : MESSAGES.perMinute);
      return;
    }
    if (code === "upstream" || code === "forbidden") {
      setBanner(MESSAGES.upstream);
      return;
    }
    // "bad_request" and anything else
    setBanner(MESSAGES.badRequest);
  }, []);

  const { messages, setMessages, setInput: setChatInput, input, append, stop, status } = useChat({
    api: "/api/chat",
    headers: { "x-gta6-client": "1" },
    fetch: trimmingFetch.current,
    onError: handleError,
    onFinish: () => {
      // Increment quota only after the server successfully completes a response.
      incrementQuota();
      setRemaining(remainingQuota());
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  // Restore the current conversation from sessionStorage (per-tab, no server storage).
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed as Message[]);
        }
      }
    } catch {
      // Corrupted storage — start with an empty chat.
    }
    hydratedRef.current = true;
    setRemaining(remainingQuota());
  }, [setMessages]);

  // Persist after hydration so a page reload restores the conversation.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable — chat simply won't persist.
    }
  }, [messages]);

  // Auto-scroll to the bottom as tokens arrive.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, status]);

  // Auto-grow the textarea up to 4 lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [input]);

  // Track offline/online state so we can show the offline message.
  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      if (isQuotaExhausted()) {
        setBanner(MESSAGES.dailyLimit);
        return;
      }
      setBanner(null);
      setChatInput("");
      try {
        // NOTE: Server-side daily limiter is the authority (spec §5.3).
        // Quota is incremented in onFinish only after a successful response.
        await append({ role: "user", content: trimmed });
      } catch (error) {
        handleError(error);
      }
    },
    [append, handleError, isStreaming, setChatInput],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  }

  function clearChat() {
    stop();
    setMessages([]);
    setBanner(null);
    setChatInput("");
    try {
      window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Storage unavailable — nothing to clear.
    }
  }

  const quotaExhausted = remaining <= 0;
  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div className="mx-auto w-full max-w-[760px] rounded-2xl border border-border bg-surface shadow-lg">
      {/* Widget toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
        <QuotaBadge remaining={remaining} />
        <button
          type="button"
          onClick={clearChat}
          aria-label="Clear chat"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted transition-colors hover:border-accent-from hover:text-text"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear chat
        </button>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex min-h-[440px] max-h-[60vh] flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <p className="text-sm text-muted">
              Ask me anything about GTA 6 — release date, map, characters, hardware and more.
            </p>
            <SuggestedChips onSend={(text) => void send(text)} disabled={quotaExhausted} />
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}

        {status === "submitted" ? (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1 rounded-2xl border border-border bg-surface-2 px-4 py-3"
              aria-label="Assistant is typing"
            >
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="h-2 w-2 animate-pulse rounded-full bg-muted"
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Error banner */}
      {banner ? (
        <div
          role="alert"
          className="mx-4 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent-from/40 bg-surface-2 px-3 py-2 text-xs text-text sm:mx-6 sm:text-sm"
        >
          <span>{banner}</span>
          {banner === MESSAGES.dailyLimit ? (
            <Button asChild size="sm" variant="outline">
              <a href={CONFIG.DONATION_URL} target="_blank" rel="noopener noreferrer">
                <Coffee className="h-4 w-4" aria-hidden="true" />
                Support
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Composer */}
      <div className="flex items-end gap-2 border-t border-border px-4 py-3 sm:px-6">
        <Textarea
          ref={textareaRef}
          value={input}
          rows={1}
          onChange={(event) => setChatInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            quotaExhausted ? "Daily limit reached — come back tomorrow" : "Ask anything about GTA 6…"
          }
          disabled={quotaExhausted || isOffline}
          aria-label="Your question about GTA 6"
          className="min-h-[44px] resize-none"
        />
        {isStreaming ? (
          <Button
            type="button"
            variant="outline"
            onClick={stop}
            aria-label="Stop generating"
            className="shrink-0"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void send(input)}
            disabled={!input.trim() || quotaExhausted || isOffline}
            aria-label="Send message"
            className={cn("shrink-0")}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
        )}
      </div>
      <p className="px-4 pb-3 text-center text-[11px] text-muted sm:px-6">
        AI answers may contain errors — always verify with official sources.
      </p>
    </div>
  );
}
