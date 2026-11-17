import { Countdown } from "@/components/Countdown";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--accent-from) 0%, transparent 60%), radial-gradient(50% 40% at 80% 10%, var(--accent-to) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-[760px] text-center">
        <Badge variant="secondary" className="mb-4">
          Unofficial fan project
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-wide text-text sm:text-6xl">
          Ask Anything About <span className="text-gradient">GTA 6</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
          Free AI assistant trained on official news, trailers &amp; confirmed facts.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <Countdown />
        </div>
      </div>
    </section>
  );
}
