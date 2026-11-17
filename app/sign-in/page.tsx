"use client";

import { useState } from "react";
import { z, type ZodError } from "zod";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { PasswordInput } from "@/components/PasswordInput";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/lib/config";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof SignInFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = signInSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInFormData, string>> = {};
      for (const issue of (result.error as ZodError).issues) {
        const path = issue.path[0] as keyof SignInFormData;
        fieldErrors[path] = issue.message;
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
      const { error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      });

      if (error) {
        toast.error("Sign in failed", {
          description: "Invalid email or password.",
        });
        return;
      }

      toast.success("Welcome back", {
        description: `You're signed in to ${CONFIG.SITE_NAME}.`,
      });
    } catch {
      toast.error("Sign in failed", {
        description: "Invalid email or password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-display text-3xl tracking-wide text-text"
        aria-label={`${CONFIG.SITE_NAME} home`}
      >
        <span className="text-gradient">GTA6</span> AI
      </Link>

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display tracking-tight">
            Sign in
          </CardTitle>
          <CardDescription>
            Sign in to {CONFIG.SITE_NAME} and keep asking about GTA 6.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-muted block"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={submitting}
                value={formData.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={cn("w-full", errors.email && "border-destructive")}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-muted block"
              >
                Password
              </label>
              <PasswordInput
                input={
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                    value={formData.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    className={cn("w-full pr-11", errors.password && "border-destructive")}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                }
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center">
          <p className="text-sm text-muted">
            Need an account?{" "}
            <a
              href="/sign-up"
              className="text-accent-from underline-offset-4 hover:underline"
            >
              Create account
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
