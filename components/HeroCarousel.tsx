'use client';

// components/HeroCarousel.tsx
//
// A Tokopedia-style hero banner carousel for the home page. Auto-rotates
// through a set of promotional slides, with prev/next arrows and clickable
// dot indicators. Each slide is a gradient panel with a headline, subtext, and
// a call-to-action link into the catalog.
//
// It is width-agnostic: it fills its parent, so dropping it inside the home
// page's `max-w-7xl` section makes it line up exactly with the product grid
// below. Rounded corners and a fixed aspect give it the banner look.
//
// Accessibility: the region is labelled, arrows and dots have aria-labels, and
// auto-advance pauses on hover/focus so it never yanks focus or motion away
// from a user reading a slide.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  /** Tailwind gradient classes for the slide background. */
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Fresh styles, every season',
    subtitle: 'Explore the latest apparel, footwear and accessories at RevoGarb.',
    ctaLabel: 'Shop now',
    href: '/products',
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
  },
  {
    id: 2,
    title: 'Step into something new',
    subtitle: 'Running shoes and sneakers built for comfort and speed.',
    ctaLabel: 'Browse footwear',
    href: '/products?category=2',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
  },
  {
    id: 3,
    title: 'Complete the look',
    subtitle: 'Caps, bags, belts and more to finish any outfit.',
    ctaLabel: 'Shop accessories',
    href: '/products?category=3',
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Auto-advance on a timer, paused on hover/focus. The interval is recreated
  // whenever the active index or pause state changes, so it always advances
  // from the current slide.
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, count]);

  return (
    <section
      aria-label="Promotions"
      aria-roledescription="carousel"
      className="relative mb-8 w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Track: all slides in a row, shifted by index. */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className={`relative flex min-h-48 w-full shrink-0 flex-col justify-center gap-3 bg-gradient-to-r px-6 py-8 sm:min-h-64 sm:px-10 ${slide.gradient}`}
          >
            <h2 className="max-w-md text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {slide.title}
            </h2>
            <p className="max-w-md text-sm text-white/90 sm:text-base">
              {slide.subtitle}
            </p>
            <div>
              <Link
                href={slide.href}
                tabIndex={i === index ? 0 : -1}
                className="inline-flex rounded-md bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
