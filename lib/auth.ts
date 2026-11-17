import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../db";

type MemoryStore = Record<string, Record<string, unknown>[]>;

const globalForAuth = globalThis as typeof globalThis & {
  __betterAuthMemoryDb?: MemoryStore;
};

const memoryDb: MemoryStore =
  globalForAuth.__betterAuthMemoryDb ??
  (globalForAuth.__betterAuthMemoryDb = {
    user: [],
    session: [],
    account: [],
    verification: [],
  });

function extractHost(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

const extraHosts = [
  extractHost(process.env.BETTER_AUTH_URL),
  extractHost(process.env.APP_URL),
  extractHost(process.env.ALLOWED_ORIGIN),
  extractHost(process.env.NEXT_PUBLIC_APP_URL),
].filter((host): host is string => Boolean(host));

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "127.0.0.1:3000",
      "0.0.0.0:3000",
      "*.run.app",
      ...extraHosts,
    ],
    fallback:
      process.env.BETTER_AUTH_URL ||
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    protocol: "auto",
  },
  database: client
    ? mongodbAdapter(client.db(), { client })
    : memoryAdapter(memoryDb),
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account",
          },
        },
      }
    : {}),
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "ai-studio-dev-secret-change-in-production",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "https://*.run.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
    ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : []),
  ],
});