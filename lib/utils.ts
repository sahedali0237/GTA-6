import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hash an IP address with a salt using SHA-256, returning the first 16 hex chars.
 * NOTE: Uses the async Web Crypto API instead of node:crypto so this module can
 * also be imported from client components (cn() lives here) without pulling a
 * Node built-in into the browser bundle. Node 20 exposes Web Crypto globally.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return hex.slice(0, 16);
}

/**
 * Format an ISO date string into a human-readable form, e.g. "November 19, 2026".
 * Uses a fixed locale + UTC timezone so server and client render identically.
 */
export function formatHumanDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
