import { z } from "zod";

export interface UserIdentity {
  name?: string | null;
  email?: string | null;
}

export function getDisplayName(user: UserIdentity): string {
  const trimmedName = user.name?.trim();
  if (trimmedName) return trimmedName;

  const trimmedEmail = user.email?.trim();
  if (trimmedEmail) {
    const localPart = trimmedEmail.split("@")[0]?.trim();
    return localPart || trimmedEmail;
  }

  return "Player";
}

export function getUserInitial(name?: string | null, email?: string | null): string {
  const displayName = getDisplayName({ name, email });
  const firstChar = Array.from(displayName)[0];
  return (firstChar ?? "U").toUpperCase();
}

export function isValidAvatarUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;
  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(50, "Display name must be 50 characters or fewer."),
  image: z
    .string()
    .trim()
    .max(500, "Avatar URL must be 500 characters or fewer.")
    .refine(isValidAvatarUrl, {
      message: "Avatar URL must be a valid http(s) URL or relative path.",
    }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function rewriteSetCookieForIframe(cookieHeader: string, isHttps: boolean): string {
  const parts = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return cookieHeader;

  const filtered = parts.filter((part) => {
    const lower = part.toLowerCase();
    return !lower.startsWith("samesite=") && lower !== "secure";
  });

  if (isHttps) {
    filtered.push("SameSite=None", "Secure");
  } else {
    filtered.push("SameSite=Lax");
  }

  return filtered.join("; ");
}
