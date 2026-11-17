import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

import { CONFIG } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { chatSchema, type ChatPayload } from "@/lib/schema";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { hashIp } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

// NOTE: Created at module level per spec §5.5. The key is only referenced in
// this file; it is never bundled into client code (verify: grep -r "sk-or" .next/static).
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  headers: {
    "HTTP-Referer": process.env.ALLOWED_ORIGIN ?? "",
    "X-Title": "GTA6 AI",
  },
});

function jsonError(status: number, code: string): Response {
  return Response.json({ error: code }, { status });
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * The request origin must match the configured site host in production.
 * NOTE: If ALLOWED_ORIGIN is unset, fall back to the request's own host so the
 * check still defends against cross-site abuse; dev mode skips the check.
 */
function isAllowedOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? new URL(req.url).origin;
  let allowedHost: string;
  try {
    allowedHost = new URL(allowedOrigin).host;
  } catch {
    return false;
  }

  const raw = req.headers.get("origin") ?? req.headers.get("referer");
  if (!raw) return false;
  try {
    return new URL(raw).host === allowedHost;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Method + transport-level checks.
  if (req.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return jsonError(400, "bad_request");
  }
  if (req.headers.get("x-gta6-client") !== "1") {
    return jsonError(403, "forbidden");
  }
  if (!isAllowedOrigin(req)) {
    return jsonError(403, "forbidden");
  }

  // 2. Parse + validate the payload.
  let payload: ChatPayload;
  try {
    const body: unknown = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "bad_request");
    payload = parsed.data;
  } catch {
    return jsonError(400, "bad_request");
  }

  if (payload.messages[payload.messages.length - 1]?.role !== "user") {
    return jsonError(400, "bad_request");
  }

  // 3. Rate limiting — per-minute first, then daily. Server is the authority.
  const ip = getClientIp(req);
  // NOTE: A missing IP_HASH_SALT is not fatal; the hash stays stable per server
  // instance, which is all the limiter needs. Set a strong salt in production.
  const ipHash = await hashIp(ip, process.env.IP_HASH_SALT ?? "insecure-default-salt");

  const { perMinute, perDay } = await checkRateLimit(ipHash);
  if (!perMinute.success || !perDay.success) {
    return jsonError(429, "limit");
  }

  // 4. Call OpenRouter and stream the answer back.
  try {
    const result = streamText({
      model: openrouter(process.env.OPENROUTER_MODEL ?? CONFIG.DEFAULT_MODEL),
      system: buildSystemPrompt(),
      messages: payload.messages,
      temperature: 0.4,
      maxTokens: 350,
      abortSignal: AbortSignal.timeout(25_000),
      providerOptions: {
        openrouter: { models: [...CONFIG.FALLBACK_MODELS] },
      },
      onFinish({ usage, finishReason }) {
        // NOTE: One structured log line; never message content (spec §5.5).
        console.log(
          JSON.stringify({
            ts: new Date().toISOString(),
            ipHash,
            model: process.env.OPENROUTER_MODEL ?? CONFIG.DEFAULT_MODEL,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            finishReason,
          }),
        );
      },
      onError({ error }) {
        // Logged without forwarding anything to the client.
        console.error(JSON.stringify({ ts: new Date().toISOString(), upstreamError: String(error) }));
      },
    });
    return result.toDataStreamResponse();
  } catch (error) {
    // Never forward provider error text to the client (spec §5.5).
    console.error(JSON.stringify({ ts: new Date().toISOString(), upstreamError: String(error) }));
    return jsonError(502, "upstream");
  }
}

// NOTE: POST only — everything else is rejected.
export function GET(): Response {
  return jsonError(405, "bad_request");
}

export function PUT(): Response {
  return jsonError(405, "bad_request");
}

export function DELETE(): Response {
  return jsonError(405, "bad_request");
}
