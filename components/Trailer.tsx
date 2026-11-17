"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

import { CONFIG } from "@/lib/config";

export function Trailer() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section aria-labelledby="trailer-heading" className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6">
      <h2 id="trailer-heading" className="font-display text-3xl tracking-wide text-text sm:text-4xl">
        Official <span className="text-gradient">Trailer</span>
      </h2>
      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2">
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${CONFIG.TRAILER_YOUTUBE_ID}?autoplay=1&rel=0`}
            title="Grand Theft Auto VI — official trailer"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            aria-label="Play the official GTA 6 trailer"
            className="group absolute inset-0 h-full w-full"
          >
            <Image
              src={`https://i.ytimg.com/vi/${CONFIG.TRAILER_YOUTUBE_ID}/hqdefault.jpg`}
              alt="Grand Theft Auto VI trailer thumbnail"
              width={480}
              height={360}
              sizes="(max-width: 1100px) 100vw, 1100px"
              className="absolute inset-0 h-full w-full object-cover"
              priority={false}
            />
            <span
              className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20"
              aria-hidden="true"
            />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-gradient text-[#0b0b0f] shadow-lg transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 fill-current" aria-hidden="true" />
            </span>
            <span className="absolute bottom-3 left-4 text-sm font-medium text-white drop-shadow">
              Watch the official trailer — click to load (YouTube)
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
