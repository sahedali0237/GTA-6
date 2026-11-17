"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, User, UserPlus, Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONFIG } from "@/lib/config";
import { authClient } from "@/lib/auth-client";

const Navbar = () => {
  // Standard Better Auth destructuring for reliable session state
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [signOutPending, setSignOutPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Defer auth-dependent UI until after hydration so the server and client
  // render identical HTML (avoids React hydration mismatches).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure we only show authenticated UI once mounted and user exists
  const isSignedIn = mounted && Boolean(user);

  const handleSignOut = async (event: React.MouseEvent) => {
    event.preventDefault();
    setSignOutPending(true);
    try {
      await authClient.signOut();
    } catch {
      // Sign out is best-effort for the UI; cookies are cleared regardless.
    } finally {
      setSignOutPending(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-bg/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-275 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-wide text-text"
          aria-label={`${CONFIG.SITE_NAME} home`}
        >
          <span className="text-gradient">GTA6</span> AI
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={CONFIG.DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Coffee className="h-4 w-4" aria-hidden="true" />
              Support
            </a>
          </Button>

          {isSignedIn && user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted">
                Hi, {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={signOutPending}
              >
                {signOutPending ? (
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Sign out
                  </>
                )}
              </Button>
            </>
          ) : (
            // Only render guest buttons once mounted and the session check is finished
            mounted &&
            !isPending && (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href="/sign-in">
                    <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Sign in
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a href="/sign-up">
                    <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Sign up
                  </a>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
