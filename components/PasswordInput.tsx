"use client";

import { cloneElement, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Shared password-field logic (show/hide toggle + Caps Lock warning),
 * extracted from app/sign-up/SignUpForm.tsx. The input element itself is
 * passed in by each form so it keeps its own exact styling; this component
 * only adds the toggle button and the Caps Lock warning around it.
 */
export function PasswordInput({
  input,
}: {
  input: ReactElement<ComponentProps<"input">>;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const { onKeyUp, onBlur } = input.props;

  return (
    <>
      <div className="relative">
        {cloneElement(input, {
          type: show ? "text" : "password",
          onKeyUp: (event) => {
            setCaps(event.getModifierState("CapsLock"));
            onKeyUp?.(event);
          },
          onBlur: (event) => {
            setCaps(false);
            onBlur?.(event);
          },
        })}
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/50 transition hover:text-white"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {caps ? (
        <p className="mt-1.5 text-xs text-amber-400">Caps Lock is on.</p>
      ) : null}
    </>
  );
}
