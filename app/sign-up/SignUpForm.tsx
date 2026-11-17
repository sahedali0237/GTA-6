"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/PasswordInput";

type Fields = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof Fields, string>>;

const RULES = [
  {
    id: "len",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "case",
    label: "Upper and lower case letters",
    test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "sym", label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const BAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-green-500",
];
const STRENGTH_LABELS = ["Too weak", "Weak", "Okay", "Good", "Strong"];

function validate(v: Fields): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email address.";
  if (v.password.length < 8) e.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
    e.password = "Include at least one letter and one number.";
  if (!v.confirm) e.confirm = "Confirm your password.";
  else if (v.confirm !== v.password) e.confirm = "Passwords don't match.";
  if (!v.terms) e.terms = "You need to accept the terms to continue.";
  return e;
}

const inputClass = (invalid: boolean) =>
  `w-full rounded-lg border bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition
   focus:ring-2 ${
     invalid
       ? "border-red-500/70 focus:ring-red-500/40"
       : "border-white/10 focus:border-white/30 focus:ring-white/20"
   }`;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-white/80"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

// TODO: replace with your real auth call (NextAuth, Supabase, Clerk, API route...).
async function signUp(data: Pick<Fields, "name" | "email" | "password">) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Could not create your account.");
  }
}

export function SignUpForm() {
  const [values, setValues] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof Fields, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = validate(values);
  const show = (k: keyof Fields) =>
    touched[k] || submitted ? errors[k] : undefined;

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));
  const blur = (k: keyof Fields) => setTouched((t) => ({ ...t, [k]: true }));

  const score = RULES.filter((r) => r.test(values.password)).length;
  const hasConfirm = values.confirm.length > 0;
  const matches = hasConfirm && values.confirm === values.password;
  const confirmInvalid =
    !!show("confirm") || (hasConfirm && !matches && touched.confirm === true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success("Account created. Welcome aboard!");
      // router.push("/") or redirect to verify-email page here
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-6 shadow-2xl backdrop-blur sm:p-8">
      <h1
        className="text-4xl tracking-wide text-white"
        style={{ fontFamily: "var(--font-bebas)" }}
      >
        Create your account
      </h1>
      <p className="mt-1 text-sm text-white/60">
        Save your chats and get the latest GTA 6 answers.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <Field id="name" label="Name" error={show("name")}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            aria-invalid={!!show("name")}
            aria-describedby={show("name") ? "name-error" : undefined}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            className={inputClass(!!show("name"))}
          />
        </Field>

        <Field id="email" label="Email" error={show("email")}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={values.email}
            aria-invalid={!!show("email")}
            aria-describedby={show("email") ? "email-error" : undefined}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            className={inputClass(!!show("email"))}
          />
        </Field>

        <Field id="password" label="Password" error={show("password")}>
          <PasswordInput
            input={
              <input
                id="password"
                name="password"
                type="password"
                value={values.password}
                placeholder="Create a password"
                autoComplete="new-password"
                aria-invalid={!!show("password")}
                aria-describedby="password-strength password-error"
                onChange={(e) => set("password", e.target.value)}
                onBlur={() => blur("password")}
                className={`${inputClass(!!show("password"))} pr-11`}
              />
            }
          />

          {/* Strength meter */}
          <div id="password-strength" className="mt-3" aria-live="polite">
            <div className="flex gap-1.5">
              {BAR_COLORS.map((color, i) => (
                <div
                  key={color}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    values.password && i < score ? color : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-white/50">
              {values.password
                ? `Strength: ${STRENGTH_LABELS[score]}`
                : "Use a mix of letters, numbers and symbols."}
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {RULES.map((r) => {
                const ok = r.test(values.password);
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-400" : "text-white/40"}`}
                  >
                    {ok ? (
                      <Check className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </Field>

        <Field id="confirm" label="Confirm password" error={show("confirm")}>
          <PasswordInput
            input={
              <input
                id="confirm"
                name="confirm"
                type="password"
                value={values.confirm}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                aria-invalid={confirmInvalid}
                aria-describedby="confirm-status confirm-error"
                onChange={(e) => set("confirm", e.target.value)}
                onBlur={() => blur("confirm")}
                className={`${inputClass(confirmInvalid)} pr-11`}
              />
            }
          />
          <p
            id="confirm-status"
            aria-live="polite"
            className={`mt-1.5 flex items-center gap-1.5 text-xs ${
              !hasConfirm
                ? "hidden"
                : matches
                  ? "text-green-400"
                  : "text-white/50"
            }`}
          >
            {hasConfirm && matches ? (
              <>
                <Check className="size-3.5" /> Passwords match
              </>
            ) : null}
          </p>
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/70">
            <input
              type="checkbox"
              checked={values.terms}
              onChange={(e) => set("terms", e.target.checked)}
              onBlur={() => blur("terms")}
              aria-invalid={!!show("terms")}
              aria-describedby={show("terms") ? "terms-error" : undefined}
              className="mt-0.5 size-4 rounded border-white/20 bg-white/5 accent-white"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-white underline underline-offset-2"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-white underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {show("terms") ? (
            <p
              id="terms-error"
              role="alert"
              className="mt-1.5 text-xs text-red-400"
            >
              {show("terms")}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-white underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
