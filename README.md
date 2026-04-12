# react-starfield

A decorative twinkling starfield overlay for React. Deterministic server-side rendering (no hydration flicker), accessible (`aria-hidden`, no pointer events), and respects `prefers-reduced-motion`.

![stars](https://img.shields.io/badge/stars-292_by_default-ff6a1a)

## Install

```sh
npm install paigesaez/react-starfield
```

## Usage

```tsx
import { Starfield } from "react-starfield";
import "react-starfield/css";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen">
      <Starfield />
      {children}
    </div>
  );
}
```

The wrapper needs `position: relative` (or `absolute`/`fixed`) so the stars anchor correctly.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `292` | Total number of stars |
| `palette` | `string[]` | Rainbow gradient | Array of hex color strings |
| `seed` | `number` | `42` | PRNG seed — same seed = same layout every render |
| `intensity` | `number` | `1` | Global opacity multiplier (0–1) |
| `className` | `string` | `""` | Extra classes on the wrapper div |

## Examples

```tsx
// Wizard purple sky
<Starfield
  palette={["#7c3aed", "#a78bfa", "#c4b5fd", "#60a5fa"]}
  count={200}
  seed={1337}
/>

// Sparse gold dust
<Starfield
  palette={["#d4a017", "#f5d060", "#fff4c1"]}
  count={60}
  intensity={0.6}
/>

// Dense white snow
<Starfield
  palette={["#ffffff", "#e0e0e0", "#c0c0c0"]}
  count={500}
  seed={99}
/>
```

## How it works

Stars are generated at module load using a seeded PRNG ([mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)), so the layout is identical on server and client — no flash of repositioning on hydrate.

Four size classes give visual depth: lots of tiny dim stars in back, a handful of big bright ones up front. Each star pulses independently via CSS `@keyframes` with randomized duration and delay.

## CSS

Import `react-starfield/css` to get the twinkle animation. If you'd rather write your own, the relevant class is `.starfield-star` — give it an `animation-name` and you're set.

## License

MIT
