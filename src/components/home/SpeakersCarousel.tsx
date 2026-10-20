"use client";

import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MiniAura } from "@/components/aura/MiniAura";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { SPEAKER_CATEGORY_META } from "@/lib/content/constants";
import type { Speaker } from "@/lib/content/types";

export function SpeakersCarousel({ speakers }: { speakers: Speaker[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  // Take the first 3 speakers with photos for the CTA banner avatar cluster
  const previewSpeakers = (speakers.filter((s) => s.photo).length >= 3 ? speakers.filter((s) => s.photo) : speakers).slice(0, 3);


  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive visible count: 4 on desktop, 2 on tablet, 1 on mobile
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, speakers.length - visibleCount);

  // Keep index within valid bounds when resizing
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay every 4.5 seconds, pauses on hover
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, nextSlide]);

  // Touch / Swipe gestures for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!speakers.length) return null;

  return (
    <section
      id="speakers-carousel"
      aria-labelledby="speakers-carousel-title"
      className="container-site relative z-10 py-12 sm:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-subtle">
            <MiniAura />
            <span>MEET OUR SPEAKERS</span>
          </div>
          <h2
            id="speakers-carousel-title"
            className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl"
          >
            Meet Our Speakers
          </h2>
          <p className="mt-2 text-base text-muted sm:text-lg">
            Meet the minds shaping the future of Agentic AI.
          </p>
        </div>

        {/* Left / Right Arrow Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous speaker"
            className="grid h-10 w-10 place-items-center rounded-full border border-border/80 bg-surface/90 text-fg shadow-xs transition-all hover:border-brand/40 hover:bg-surface-2 hover:text-brand active:scale-95 disabled:opacity-30 dark:bg-surface/80"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next speaker"
            className="grid h-10 w-10 place-items-center rounded-full border border-border/80 bg-surface/90 text-fg shadow-xs transition-all hover:border-brand/40 hover:bg-surface-2 hover:text-brand active:scale-95 disabled:opacity-30 dark:bg-surface/80"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        className="overflow-hidden px-1 -mx-1 py-4 -my-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {speakers.map((sp) => {
            const cat = SPEAKER_CATEGORY_META[sp.category] ?? SPEAKER_CATEGORY_META.academia;
            const profileUrl = sp.website || sp.linkedin || sp.scholar || sp.github || "";

            return (
              <div
                key={sp.id || sp.name}
                className="shrink-0 px-2.5 sm:px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <article
                  className={cn(
                    `tone-${cat.tone}`,
                    "group card relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg dark:bg-surface/90",
                  )}
                >
                  {/* Subtle top accent wash */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%)] opacity-70"
                  />

                  {/* 1. Circular Avatar */}
                  <div className="relative mb-3.5">
                    <span
                      aria-hidden
                      className="absolute -inset-1 rounded-full bg-[conic-gradient(from_120deg,var(--accent),var(--lilac),var(--mint),var(--accent))] opacity-60 blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <Avatar
                      name={sp.name}
                      src={sp.photo}
                      size={100}
                      className="relative ring-4 ring-surface"
                    />
                  </div>

                  {/* 5. Academia / Industry Badge */}
                  <div className="mb-2.5">
                    <Badge tone={cat.tone} size="xs">
                      {cat.label}
                    </Badge>
                  </div>

                  {/* 2. Full Name */}
                  <h3 className="font-display text-base font-bold text-fg sm:text-lg leading-snug line-clamp-2 min-h-[2.8rem] flex items-center justify-center">
                    {sp.name}
                  </h3>

                  {/* 3. Designation */}
                  <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2 min-h-[2.2rem] flex items-center justify-center">
                    {sp.designation}
                  </p>

                  {/* 4. Institution / Company */}
                  <p className="mt-1 text-xs font-semibold text-subtle line-clamp-1">
                    {sp.affiliation}
                  </p>

                  {/* 6. View Profile Button (Only if profileUrl exists) */}
                  {profileUrl ? (
                    <div className="mt-auto pt-4 w-full">
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-semibold text-accent-ink shadow-2xs transition-all hover:bg-accent-soft hover:border-brand/40"
                        aria-label={`View profile of ${sp.name} (opens in a new tab)`}
                      >
                        <span>View Profile</span>
                        <ArrowUpRight size={13} aria-hidden />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-auto" />
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      {maxIndex > 0 ? (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentIndex === idx
                  ? "w-6 bg-brand dark:bg-azure"
                  : "w-2 bg-border-strong hover:bg-muted",
              )}
            />
          ))}
        </div>
      ) : null}

      {/* "Meet All 11 Speakers" Call-to-Action Section */}
      <Link
        href="/speakers"
        aria-label={`Meet all ${speakers.length || 11} speakers: keynotes, invited talks and panelists, with their bios, talk titles and abstracts`}
        className="group mt-8 block w-full rounded-[24px] border border-border/80 bg-[linear-gradient(108deg,#ffffff_0%,#f8f6ff_55%,#f2faf6_100%)] p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-lilac/70 hover:shadow-card-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-[linear-gradient(108deg,var(--surface)_0%,#1d2138_55%,#162a34_100%)] dark:hover:border-lilac/50 sm:mt-10 sm:p-7 md:p-8"
      >
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
          {/* Left: Lavender-tinted rounded rectangular panel with overlapping speaker avatars */}
          <div className="flex shrink-0 items-center justify-center gap-2.5 rounded-2xl border border-[#d8ceff] bg-[#ece7ff] px-4 py-3 shadow-xs transition-colors duration-300 group-hover:border-lilac dark:border-[#413670] dark:bg-[#282148] sm:flex-col sm:gap-1.5 sm:px-4 sm:py-3.5">
            <div className="flex items-center -space-x-3.5">
              {previewSpeakers.map((sp, idx) => (
                <span
                  key={sp.id || sp.slug || sp.name}
                  className="inline-block rounded-full shadow-xs ring-2 ring-[#ece7ff] transition-transform duration-300 group-hover:scale-105 dark:ring-[#282148]"
                  style={{ zIndex: 3 - idx }}
                >
                  <Avatar name={sp.name} src={sp.photo} size={42} />
                </span>
              ))}
            </div>
            <span className="inline-flex items-center rounded-full border border-[#ddd3ff] bg-white/95 px-2.5 py-0.5 text-[11px] font-bold tracking-tight text-[#6842c2] shadow-2xs dark:border-[#42376e] dark:bg-[#181528] dark:text-[#c3b1ff]">
              {speakers.length || 11} speakers
            </span>
          </div>

          {/* Center: Eyebrow label, main heading, and description */}
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold tracking-[0.16em] text-[#6842c2] uppercase dark:text-[#b7a3ff]">
              SPEAKERS
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-fg transition-colors group-hover:text-[#5233a8] sm:text-2xl dark:group-hover:text-[#c3b1ff]">
              Meet all {speakers.length || 11} speakers
            </h3>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">
              Keynotes, invited talks and panelists, with their bios, talk titles and abstracts.
            </p>
          </div>

          {/* Right: Dotted decorative line leading to a rounded-square arrow button */}
          <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
            <svg
              viewBox="0 0 44 12"
              className="hidden h-3 w-11 md:block"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="2"
                y1="6"
                x2="42"
                y2="6"
                stroke="#b7a3ff"
                strokeWidth="2"
                strokeDasharray="3 4"
                strokeLinecap="round"
                className="transition-colors duration-300 group-hover:stroke-[#7c56dc]"
              />
              <circle
                cx="2"
                cy="6"
                r="2.5"
                fill="#7c56dc"
                className="dark:fill-[#b7a3ff]"
              />
            </svg>

            <span
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#7c56dc] text-white shadow-card transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-6deg] group-hover:bg-[#6842c2] group-hover:shadow-md dark:bg-[#7c56dc] dark:text-white dark:group-hover:bg-[#8f6aff]"
              aria-hidden="true"
            >
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
