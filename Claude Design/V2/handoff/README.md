# Tron Light-Ribbons — Design Handoff

Scroll-driven background for **INNOCOOKS / Frontend_2** (Next.js App Router, React + TS).
Two neon light-ribbons — **orange** + **electric blue** — draw on scroll *behind* the
page text, curving through chosen keywords. As the blue ribbon's leading edge reaches
an orange keyword, that word **converts to blue**.

No grid lines, no physics, no per-frame animation. Paths are computed once per layout;
scrolling only updates two CSS variables, so it stays smooth (fixes the earlier lag).

---

## Files

| File | Drop into | Purpose |
|------|-----------|---------|
| `components/RibbonField.tsx`   | `Frontend_2/components/` | The effect. Wrap page content with it. |
| `components/RibbonKeyword.tsx` | `Frontend_2/components/` | Optional readable wrapper for a keyword. |
| `styles/ribbon.css`            | append to `Frontend_2/app/globals.css` | Keyword color transition. |

`RibbonField` is the existing **ThreadSpine** concept, reworked — you can replace the
old spine usage with it.

---

## Integration (3 steps)

**1 — Wrap your page** (`app/page.tsx`). `RibbonField` renders a `position:relative`
wrapper + an absolute SVG layer, then your content above it:

```tsx
import RibbonField from '@/components/RibbonField';

export default function Page() {
  return (
    <RibbonField intensity={1}>
      <Hero />
      <Manifesto />
      <Work />
      <Process />
      <CTA />
      <Footer />
    </RibbonField>
  );
}
```

**2 — Mark the origin** where the ribbons emit (the hero "SCROLL" hint is ideal):

```tsx
<div data-ribbon-origin className="scroll-hint">…</div>
```

Optionally mark where they should end (defaults to the bottom of the page):

```tsx
<div data-ribbon-end />   {/* e.g. on the footer logo */}
```

**3 — Mark any keywords** you want connected + converted. This is the generic part —
**any** element with `data-ribbon-kw` becomes a node, in top-to-bottom order:

```tsx
We engineer <span data-ribbon-kw style={{ color: '#c45b35' }}>systems</span> that
<span data-ribbon-kw style={{ color: '#c45b35' }}>compound</span>.
```

or with the wrapper:

```tsx
import RibbonKeyword from '@/components/RibbonKeyword';

We engineer <RibbonKeyword>systems</RibbonKeyword> that <RibbonKeyword>compound</RibbonKeyword>.
We build something that <RibbonKeyword serif>lasts</RibbonKeyword>.
```

Then add `styles/ribbon.css` to `globals.css`.

That's it. Add/remove `data-ribbon-kw` on any word, anywhere in the page — the ribbon
re-threads through them automatically (re-measured on mount, resize, and font load).

---

## How keyword targeting works (so you can extend it)

- On layout, the component reads `[data-ribbon-origin]`, every `[data-ribbon-kw]`, and
  `[data-ribbon-end]`, takes each one's **center point** relative to the wrapper, and
  sorts the keywords by vertical position.
- It builds a **Catmull-Rom spline** (rounded cubic bezier) from origin → keywords →
  end, inserting waypoints that swing to alternating margins so the two ribbons **braid**
  between words and **converge on each keyword**. Orange and blue get mirrored waypoints.
- Each keyword's **fraction along the blue path** is precomputed. On scroll, blue
  progress `pb` ≥ that fraction → the word flips to blue (`color` + glow).
- Orange leads (`po = scrollProgress`); blue follows (`pb = (progress − 0.05) / 0.9`), so
  you see orange arrive first, then blue sweep over and convert it.

### Knobs (top of `RibbonField.tsx`)
- `ORANGE` / `BLUE` — the two ribbon + keyword colors.
- `intensity` prop — glow multiplier (0.6–1.6).
- Stroke stack widths/opacities in the `ribbon()` helper — wider `glow` strokes = more
  "massive jetwall", thinner = sharper line.
- `pb` formula in `update()` — change the lag between orange arriving and blue converting.
- Waypoint margins (`W * 0.13` / `W * 0.87`) and the `280`px gap threshold in
  `pointsFor()` — how far the curves swing out and how often.

---

## Notes
- `RibbonField` is a client component (`'use client'`) — it uses scroll + layout APIs.
- Respects `prefers-reduced-motion`: renders the fully-drawn end state, no scroll anim.
- Keyword color is set via inline `style.color` in JS, so initialize keywords **orange**
  in markup to avoid a flash before hydration.
- Reference implementation (standalone, same logic): `Tron Ribbons.dc.html` in the
  project root — open it to see the exact behavior this port reproduces.
