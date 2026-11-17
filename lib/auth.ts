import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../db";

const memoryDb: Record<string, Record<string, unknown>[]> = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

export const auth = betterAuth({
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
          },
        },
      }
    : {}),
  secret: process.env.BETTER_AUTH_SECRET || "ai-studio-dev-secret-change-in-production",
  trustedOrigins: [
    "http://localhost:3000",
    "http://0.0.0.0:3000",
    "https://*.run.app",
    ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ],
});