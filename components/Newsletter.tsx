"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONFIG } from "@/lib/config";

// NOTE: Validation is client-side only; nothing is stored on our server — the
// form posts straight to the newsletter provider (Formspree/Beehiiv/Mailchimp).
const emailSchema = z.string().trim().email("Please enter a valid email address.");

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(CONFIG.NEWSLETTER_ACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: parsed.data }),
      });
      if (response.ok) {
        toast.success("You're in! Watch your inbox for GTA 6 news.");
        setEmail("");
      } else {
        toast.error("Subscription failed. Please try again later.");
      }
    } catch {
      toast.error("Subscription failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-[760px] rounded-2xl border border-border bg-surface p-6 text-center sm:p-10">
        <h2 id="newsletter-heading" className="font-display text-3xl tracking-wide text-text sm:text-4xl">
          Get GTA 6 news &amp; leaks <span className="text-gradient">first</span>
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-base">
          One email when something big drops. No spam, unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              autoComplete="email"
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
