"use client";

import { useEffect, useState } from "react";

import { CONFIG } from "@/lib/config";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}

const UNITS: Array<{ key: keyof Omit<TimeLeft, "done">; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function Countdown() {
  const target = new Date(CONFIG.RELEASE_DATE).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(computeTimeLeft(target));
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Skeleton until hydrated to avoid hydration mismatch.
  if (timeLeft === null) {
    return (
      <div
        className="grid grid-cols-4 gap-2 sm:gap-4"
        aria-hidden="true"
        data-testid="countdown-skeleton"
      >
        {UNITS.map((unit) => (
          <div
            key={unit.key}
            className="rounded-lg border border-border bg-surface px-2 py-3 text-center sm:px-4 sm:py-4"
          >
            <div className="mx-auto h-8 w-12 animate-pulse rounded bg-surface-2 sm:h-10 sm:w-16" />
            <div className="mt-2 text-xs uppercase tracking-widest text-muted">{unit.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (timeLeft.done) {
    return (
      <p className="text-center text-xl font-semibold text-gradient sm:text-2xl">
        GTA 6 is out now! 🎉
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="off">
      {UNITS.map((unit) => (
        <div
          key={unit.key}
          className="rounded-lg border border-border bg-surface px-2 py-3 text-center sm:px-4 sm:py-4"
        >
          <div className="font-display text-3xl leading-none text-text sm:text-4xl">
            {String(timeLeft[unit.key]).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs uppercase tracking-widest text-muted">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
