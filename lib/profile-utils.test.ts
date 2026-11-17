import test from "node:test";
import assert from "node:assert/strict";
import {
  getDisplayName,
  getUserInitial,
  isValidAvatarUrl,
  profileUpdateSchema,
  rewriteSetCookieForIframe,
} from "./profile-utils";

test("getDisplayName prefers trimmed user name over email", () => {
  assert.equal(getDisplayName({ name: "  Lucia Caminos ", email: "lucia@vice.city" }), "Lucia Caminos");
  assert.equal(getDisplayName({ name: "", email: "jason@leonida.gov" }), "jason");
  assert.equal(getDisplayName({ name: null, email: null }), "Player");
});

test("getUserInitial extracts uppercase first letter of name or falls back cleanly", () => {
  assert.equal(getUserInitial("sahed ali", "s@example.com"), "S");
  assert.equal(getUserInitial("  alice", "a@example.com"), "A");
  assert.equal(getUserInitial("", "mike@example.com"), "M");
  assert.equal(getUserInitial(null, null), "P");
});

test("isValidAvatarUrl allows empty, relative, http, https and rejects unsafe schemes", () => {
  assert.equal(isValidAvatarUrl(""), true);
  assert.equal(isValidAvatarUrl("   "), true);
  assert.equal(isValidAvatarUrl("/img/avatar.png"), true);
  assert.equal(isValidAvatarUrl("https://lh3.googleusercontent.com/a/avatar"), true);
  assert.equal(isValidAvatarUrl("http://localhost:3000/avatar.png"), true);
  assert.equal(isValidAvatarUrl("//evil.example.com/a.png"), false);
  assert.equal(isValidAvatarUrl("javascript:alert(1)"), false);
  assert.equal(isValidAvatarUrl("data:image/png;base64,abc"), false);
  assert.equal(isValidAvatarUrl("not a url"), false);
});

test("profileUpdateSchema validates name and image URL", () => {
  const ok = profileUpdateSchema.safeParse({
    name: "Sahed",
    image: "https://lh3.googleusercontent.com/a/123",
  });
  assert.equal(ok.success, true);

  const shortName = profileUpdateSchema.safeParse({ name: "A", image: "" });
  assert.equal(shortName.success, false);

  const badUrl = profileUpdateSchema.safeParse({
    name: "Sahed",
    image: "javascript:alert(1)",
  });
  assert.equal(badUrl.success, false);
});

test("rewriteSetCookieForIframe sets SameSite=None; Secure on HTTPS and SameSite=Lax on HTTP", () => {
  const base = "better-auth.session_token=abc123; Path=/; HttpOnly; SameSite=Lax";
  assert.equal(
    rewriteSetCookieForIframe(base, true),
    "better-auth.session_token=abc123; Path=/; HttpOnly; SameSite=None; Secure",
  );

  const withSecure = "better-auth.state=xyz; Path=/; HttpOnly; SameSite=None; Secure";
  assert.equal(
    rewriteSetCookieForIframe(withSecure, false),
    "better-auth.state=xyz; Path=/; HttpOnly; SameSite=Lax",
  );
});
