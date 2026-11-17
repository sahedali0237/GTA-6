"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Chrome, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z, type ZodError } from "zod";

import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be less than 50 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must be less than 100 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const isBusy = submitting || googlePending;

  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    if (formError) {
      setFormError(null);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);

    if (!googleEnabled) {
      const message =
        "Google sign-up requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to be configured.";

      setFormError(message);

      toast.error("Google sign-up unavailable", {
        description: message,
      });

      return;
    }

    setGooglePending(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        const message =
          error.message || "Could not start Google sign-up. Please try again.";

        setFormError(message);

        toast.error("Google sign-up failed", {
          description: message,
        });

        setGooglePending(false);
      }
    } catch {
      const message = "Unable to connect to Google sign-up right now.";

      setFormError(message);

      toast.error("Google sign-up failed", {
        description: message,
      });

      setGooglePending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);

    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};

      for (const issue of (result.error as ZodError).issues) {
        const path = issue.path[0] as keyof SignUpFormData;

        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }

      setErrors(fieldErrors);

      const firstInvalid = (result.error as ZodError).issues[0]?.path[0];

      if (typeof firstInvalid === "string") {
        document.getElementById(firstInvalid)?.focus();
      }

      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const { error } = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/",
      });

      if (error) {
        const message =
          error.message || "Could not create your account. Please try again.";

        setFormError(message);

        toast.error("Sign up failed", {
          description: message,
        });

        return;
      }

      toast.success("Account created successfully", {
        description: `Welcome to ${CONFIG.SITE_NAME}!`,
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign up error:", error);

      const message =
        "Unable to create your account right now. Please try again.";

      setFormError(message);

      toast.error("Sign up failed", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-80"
        aria-hidden="true"
      />

      <div className="space-y-1.5">
        <h2 className="font-display text-3xl tracking-wide text-text">
          Create account
        </h2>

        <p className="text-sm text-muted">
          Create your {CONFIG.SITE_NAME} account to get started.
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-text"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />

          <span>{formError}</span>
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleSignUp}
          disabled={isBusy}
          className="h-11 w-full border-border bg-surface-2/60 text-sm font-medium text-text hover:border-accent-from/50 hover:bg-surface-2"
        >
          {googlePending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Connecting to Google…
            </>
          ) : (
            <>
              <Chrome className="size-4 text-accent-to" aria-hidden="true" />
              Continue with Google
            </>
          )}
        </Button>
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border/80" />

        <span className="text-xs text-muted">or continue with email</span>

        <div className="h-px flex-1 bg-border/80" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text/90"
          >
            Full name
          </label>

          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            disabled={isBusy}
            value={formData.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className={cn(
              "h-11 bg-surface-2/80 px-3.5",
              errors.name &&
                "border-destructive focus-visible:ring-destructive",
            )}
            placeholder="Sahed Ali"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />

          {errors.name ? (
            <p
              id="name-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text/90"
          >
            Email address
          </label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={isBusy}
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={cn(
              "h-11 bg-surface-2/80 px-3.5",
              errors.email &&
                "border-destructive focus-visible:ring-destructive",
            )}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />

          {errors.email ? (
            <p
              id="email-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text/90"
          >
            Password
          </label>

          <PasswordInput
            input={
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isBusy}
                value={formData.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                className={cn(
                  "h-11 bg-surface-2/80 px-3.5 pr-11",
                  errors.password &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                placeholder="Create a password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
            }
          />

          {errors.password ? (
            <p
              id="password-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text/90"
          >
            Confirm password
          </label>

          <PasswordInput
            input={
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isBusy}
                value={formData.confirmPassword}
                onChange={(event) =>
                  handleChange("confirmPassword", event.target.value)
                }
                className={cn(
                  "h-11 bg-surface-2/80 px-3.5 pr-11",
                  errors.confirmPassword &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                placeholder="Confirm your password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
            }
          />

          {errors.confirmPassword ? (
            <p
              id="confirm-password-error"
              className="text-xs text-destructive"
              role="alert"
            >
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full text-sm font-semibold"
          disabled={isBusy}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-border/80 pt-5 text-center">
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-accent-from underline-offset-4 transition-colors hover:text-accent-to hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
