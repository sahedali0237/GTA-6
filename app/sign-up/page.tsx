import type { Metadata } from "next";

import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  alternates: { canonical: "/signsup" },
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <SignUpForm />
    </main>
  );
}