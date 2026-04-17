// Starfield — a decorative layer of softly-pulsing stars.
//
// Canvas-based: one <canvas> element, one rAF loop. No per-star DOM
// nodes, no CSS animations. Same deterministic PRNG layout so SSR
// snapshots are consistent. Pointer-events disabled, aria-hidden.

"use client";

import { useEffect, useRef } from "react";

export type StarfieldProps = {
  /** Total number of stars. Default 292. */
  count?: number;
  /** Color palette (hex strings). Defaults to a rainbow gradient. */
  palette?: string[];
  /** PRNG seed for deterministic layout. Default 42. */
  seed?: number;
  /** Global opacity multiplier (0–1). Default 1. */
  intensity?: number;
  /** Extra className on the wrapper canvas. */
  className?: string;
};

const DEFAULT_PALETTE = [
  "#ff6a1a", // orange
  "#ffa52b", // amber
  "#d4c32a", // olive
  "#8fc520", // chartreuse
  "#3cbf1a", // kelly
  "#14c9a0", // teal
  "#10b8c9", // cyan
  "#00a5e0", // sky blue
];

type Star = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  baseOpacity: number;
  color: string;
};

const SIZE_CLASSES = [
  { fraction: 0.48, sizeMin: 1.5, sizeMax: 3,  opMin: 0.25, opMax: 0.5  },
  { fraction: 0.34, sizeMin: 3,   sizeMax: 5,  opMin: 0.35, opMax: 0.65 },
  { fraction: 0.14, sizeMin: 5,   sizeMax: 8,  opMin: 0.45, opMax: 0.8  },
  { fraction: 0.04, sizeMin: 8,   sizeMax: 13, opMin: 0.55, opMax: 0.9  },
];

// mulberry32 — tiny seeded PRNG. Same seed = same star layout every render.
function makeRand(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(
  count: number,
  palette: string[],
  seed: number,
  intensity: number,
): Star[] {
  const rand = makeRand(seed);
  const stars: Star[] = [];
  for (const cls of SIZE_CLASSES) {
    const n = Math.round(count * cls.fraction);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: rand(),
        y: rand(),
        size: cls.sizeMin + rand() * (cls.sizeMax - cls.sizeMin),
        phase: rand() * Math.PI * 2,
        speed: 0.3 + rand() * 0.7,
        baseOpacity: (cls.opMin + rand() * (cls.opMax - cls.opMin)) * intensity,
        color: palette[Math.floor(rand() * palette.length)],
      });
    }
  }
  return stars;
}

export function Starfield({
  count = 292,
  palette = DEFAULT_PALETTE,
  seed = 42,
  intensity = 1,
  className = "",
}: StarfieldProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[] | null>(null);

  if (!starsRef.current) {
    starsRef.current = generateStars(count, palette, seed, intensity);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stars = starsRef.current!;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let raf: number;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      const sec = t / 1000;
      const w = canvas!.getBoundingClientRect().width;
      const h = canvas!.getBoundingClientRect().height;
      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        const pulse = reduceMotion ? 0.7 : 0.5 + 0.5 * Math.sin(s.phase + sec * s.speed);
        const opacity = s.baseOpacity * (0.3 + 0.7 * pulse);
        const scale = reduceMotion ? 1 : 0.6 + 0.4 * pulse;
        const sz = s.size * scale;
        const cx = s.x * w;
        const cy = s.y * h;

        ctx!.globalAlpha = opacity;
        ctx!.fillStyle = s.color;
        // Four-point star shape
        ctx!.beginPath();
        ctx!.moveTo(cx, cy - sz);
        ctx!.quadraticCurveTo(cx + sz * 0.15, cy - sz * 0.15, cx + sz, cy);
        ctx!.quadraticCurveTo(cx + sz * 0.15, cy + sz * 0.15, cx, cy + sz);
        ctx!.quadraticCurveTo(cx - sz * 0.15, cy + sz * 0.15, cx - sz, cy);
        ctx!.quadraticCurveTo(cx - sz * 0.15, cy - sz * 0.15, cx, cy - sz);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
