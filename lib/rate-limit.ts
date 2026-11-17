import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { CONFIG } from "@/lib/config";

export type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Limiter = {
  limit: (key: string) => Promise<LimitResult>;
};

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let warned = false;

/**
 * In-memory fallback limiter. Uses a Map keyed by identifier with TTL cleanup.
 * NOTE: This is per-instance and resets on redeploy/restart — acceptable as a
 * best-effort fallback when Upstash is not configured (e.g. local dev / single host).
 */
function createMemoryLimiter(max: number, windowMs: number): Limiter {
  const buckets = new Map<string, number[]>();

  // Periodic cleanup so the Map does not grow unbounded.
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of buckets) {
      const fresh = timestamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) buckets.delete(key);
      else buckets.set(key, fresh);
    }
  }, Math.min(windowMs, 60_000));
  // Do not keep the Node process alive just for cleanup.
  if (typeof cleanup.unref === "function") cleanup.unref();

  return {
    async limit(key: string): Promise<LimitResult> {
      const now = Date.now();
      const existing = buckets.get(key) ?? [];
      const fresh = existing.filter((t) => now - t < windowMs);
      const success = fresh.length < max;
      if (success) fresh.push(now);
      buckets.set(key, fresh);
      const oldest = fresh.length > 0 ? fresh[0] : now;
      return {
        success,
        limit: max,
        remaining: Math.max(0, max - fresh.length),
        reset: oldest + windowMs,
      };
    },
  };
}

function createUpstashLimiter(limiter: Ratelimit): Limiter {
  return {
    async limit(key: string): Promise<LimitResult> {
      const res = await limiter.limit(key);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    },
  };
}

function buildLimiters(): { perMinute: Limiter; perDay: Limiter } {
  if (hasUpstash) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return {
      perMinute: createUpstashLimiter(
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "60 s"),
          prefix: "gta6:rl:min",
        }),
      ),
      perDay: createUpstashLimiter(
        new Ratelimit({
          redis,
          limiter: Ratelimit.fixedWindow(CONFIG.DAILY_LIMIT, "24 h"),
          prefix: "gta6:rl:day",
        }),
      ),
    };
  }

  if (!warned) {
    warned = true;
    // Single startup warning as required by the spec.
    console.warn(
      "[rate-limit] Upstash env vars not set — using in-memory fallback limiter. " +
        "This is per-instance and not shared across serverless invocations.",
    );
  }

  return {
    perMinute: createMemoryLimiter(5, 60_000),
    perDay: createMemoryLimiter(CONFIG.DAILY_LIMIT, 24 * 60 * 60 * 1000),
  };
}

const limiters = buildLimiters();

export async function checkRateLimit(ipHash: string): Promise<{
  perMinute: LimitResult;
  perDay: LimitResult;
}> {
  const [perMinute, perDay] = await Promise.all([
    limiters.perMinute.limit(ipHash),
    limiters.perDay.limit(ipHash),
  ]);
  return { perMinute, perDay };
}
