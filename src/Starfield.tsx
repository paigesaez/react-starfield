// Starfield — a decorative layer of softly-pulsing stars.
//
// Drop-in React component. Renders server-side with deterministic
// positions (no hydration flicker). Pointer-events disabled,
// aria-hidden, won't interfere with clicks or screen readers.

export type StarfieldProps = {
  /** Total number of stars. Default 292. */
  count?: number;
  /** Color palette (hex strings). Defaults to a rainbow gradient. */
  palette?: string[];
  /** PRNG seed for deterministic layout. Default 42. */
  seed?: number;
  /** Global opacity multiplier (0–1). Default 1. */
  intensity?: number;
  /** Extra className on the wrapper div. */
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
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
};

type SizeClass = {
  fraction: number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
};

const SIZE_CLASSES: SizeClass[] = [
  { fraction: 0.48, sizeMin: 4,  sizeMax: 9,  opacityMin: 0.35, opacityMax: 0.7  },
  { fraction: 0.34, sizeMin: 8,  sizeMax: 14, opacityMin: 0.5,  opacityMax: 0.85 },
  { fraction: 0.14, sizeMin: 12, sizeMax: 20, opacityMin: 0.6,  opacityMax: 0.95 },
  { fraction: 0.04, sizeMin: 22, sizeMax: 34, opacityMin: 0.7,  opacityMax: 1.0  },
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

function generateStars(count: number, palette: string[], seed: number): Star[] {
  const rand = makeRand(seed);
  const stars: Star[] = [];
  for (const cls of SIZE_CLASSES) {
    const n = Math.round(count * cls.fraction);
    for (let i = 0; i < n; i++) {
      stars.push({
        top: rand() * 100,
        left: rand() * 100,
        size: cls.sizeMin + rand() * (cls.sizeMax - cls.sizeMin),
        delay: rand() * 3,
        duration: 1.2 + rand() * 1.8,
        opacity: cls.opacityMin + rand() * (cls.opacityMax - cls.opacityMin),
        color: palette[Math.floor(rand() * palette.length)],
      });
    }
  }
  return stars;
}

const cache = new Map<string, Star[]>();

export function Starfield({
  count = 292,
  palette = DEFAULT_PALETTE,
  seed = 42,
  intensity = 1,
  className = "",
}: StarfieldProps = {}) {
  const key = `${seed}:${count}`;
  if (!cache.has(key)) cache.set(key, generateStars(count, palette, seed));
  const stars = cache.get(key)!;

  return (
    <div
      aria-hidden
      className={`starfield pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="starfield-star absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            color: s.color,
            opacity: s.opacity * intensity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <path
            d="M12 2 C 12 8, 14 10, 22 12 C 14 14, 12 16, 12 22 C 12 16, 10 14, 2 12 C 10 10, 12 8, 12 2 Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}
