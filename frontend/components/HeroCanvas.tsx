"use client";

/* InnoCooks — HeroCanvas
 * Drives the Thread + Atmosphere on one rAF loop inside the hero <section>.
 * Sized to its wrapper (NOT the viewport) so it behaves inside a scrolling
 * page, with all pointer/letter coordinates converted to wrapper-local space.
 *
 * It reads the wordmark's letters from the DOM (default ".hero-letter") to
 * warm them toward gold near the cursor / where the woven thread crosses,
 * and anchors the strand to the wordmark's real position.
 *
 * Render it as the FIRST child of the hero section. Give the section
 * `position: relative; overflow: hidden`, the content layer `z-10`, and this
 * component paints behind (atmosphere/back strand, z0/1) and in front (woven
 * over-strokes, z20) of the text.
 */

import { useEffect, useRef } from "react";
import { VerletThread } from "@/lib/thread";
import { Atmosphere } from "@/lib/atmosphere";

export type HeroMode = "strand" | "dusk" | "woven";

const GOLD = "#c9a55c";
const CREAM = "#f0ebdc";

type Preset = {
  restY: number; sag: number; grav: number; width: number; glow: number;
  threadAlpha: number; mouseForce: number; wander: number; lanternInt: number;
  moteAlpha: number; weave: number; parallax: number; bead: number;
};

const MODES: Record<HeroMode, Preset> = {
  strand: { restY: 0.60, sag: 185, grav: 840, width: 7.5, glow: 1.05, threadAlpha: 1, mouseForce: 1.25, wander: 32, lanternInt: 0.45, moteAlpha: 0.55, weave: 0, parallax: 0.45, bead: 1 },
  dusk:   { restY: 0.70, sag: 120, grav: 320, width: 3.2, glow: 0.85, threadAlpha: 0.72, mouseForce: 0.7, wander: 18, lanternInt: 1.2, moteAlpha: 1.35, weave: 0, parallax: 1.25, bead: 0 },
  woven:  { restY: 0.485, sag: 30, grav: 480, width: 5, glow: 1, threadAlpha: 1, mouseForce: 0.9, wander: 9, lanternInt: 0.7, moteAlpha: 0.7, weave: 1, parallax: 0.6, bead: 0.4 },
};

function mix(a: string, b: string, t: number) {
  t = Math.max(0, Math.min(1, t));
  const ca = hex(a), cb = hex(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ease-out "bounce" — drives the load drop-in (the strand is thrown from a
// small height, bounces a few diminishing times, then settles). Range [0,1].
function easeOutBounce(x: number) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
  if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
  x -= 2.625 / d1; return n1 * x * x + 0.984375;
}

export default function HeroCanvas({
  mode = "strand",
  letterSelector = ".hero-letter",
  wordmarkSelector = "#hero-wordmark",
}: {
  mode?: HeroMode;
  letterSelector?: string;
  wordmarkSelector?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const atmoRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<HeroMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const wrap = wrapRef.current!;
    const atmoCv = atmoRef.current!;
    const backCv = backRef.current!;
    const frontCv = frontRef.current!;
    const ax = atmoCv.getContext("2d")!;
    const bx = backCv.getContext("2d")!;
    const fx = frontCv.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // touch / small screens have no cursor to track, so the strand only sways:
    // run the whole loop at 30fps with fewer segments + iterations. Roughly
    // halves the hero's cost on phones with no perceptible change to the sway.
    const lite = !finePointer || window.innerWidth < 768;

    // damping < default (0.992) so the strand settles with real weight instead
    // of drifting in slow motion; iterations keep it taut (no heavy sag) under
    // the higher gravity; gravity (per-mode) carries the rest. Point count and
    // iterations are trimmed from the old 48/20 — the quadratic-smoothed draw
    // hides the lower resolution, and the solve cost drops by ~50%.
    const thread = new VerletThread({
      count: lite ? 24 : 34,
      damping: 0.95,
      iterations: lite ? 10 : 13,
    });
    const atmo = new Atmosphere();
    const letters = Array.from(document.querySelectorAll<HTMLElement>(letterSelector));
    const wordmark = document.querySelector<HTMLElement>(wordmarkSelector);
    const warm = new Map<HTMLElement, number>();
    // preallocated letter-centre buffers so paintLetters can batch every DOM
    // read before any write — one layout/frame instead of one per letter.
    const cxs = new Float64Array(letters.length);
    const cys = new Float64Array(letters.length);

    // start fully composed in the chosen mode; the load intro (below) is the
    // only thing that animates the strand into place.
    const cur: Preset = { ...MODES[modeRef.current] };
    const mouse = { x: 0, y: 0, active: false };
    let W = 0, H = 0, dpr = 1, raf = 0, last = performance.now(), autoT = 0, beadF = 0;
    let running = false, onScreen = true;
    // letter-warming runs at ~30Hz (it eases, it doesn't need every frame) and
    // the letter centres are measured ONCE (and on resize / after fonts) rather
    // than every frame — the per-frame layout thrash was the hero's main cost.
    let warmAcc = 0, measurePending = true;
    const WARM_DT = 1 / 30;
    // atmosphere repaints at ~30Hz (its motes/glows drift slowly)
    let atmoAcc = 0;
    const ATMO_DT = 1 / 30;
    // whole-loop throttle on lite devices
    let frameAcc = 0;
    const LITE_DT = 1 / 30;
    let io: IntersectionObserver | null = null;
    let onVis: (() => void) | null = null;

    // load drop-in: the strand starts INTRO_DROP (fraction of the hero height)
    // above its resting line and bounce-eases down over INTRO_DUR, then rests.
    const INTRO_DUR = 1.1;   // seconds of drop + bounce + settle
    const INTRO_DROP = 0.14; // how high above rest it's "thrown" from
    let introT = 0, introFromRestY = 0;

    function size() {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      const device = window.devicePixelRatio || 1;
      // the strand is a thin line, so a little sharpness helps — cap at 1.5.
      // the atmosphere is pure soft glow + blurry motes: render it at DPR 1 even
      // on retina (no visible loss, ~quarter the fill cost of native 2x).
      dpr = Math.min(1.5, device);
      const aDpr = 1;
      measurePending = true; // letters reflow on resize — re-measure their centres
      for (const cv of [backCv, frontCv]) {
        cv.width = W * dpr; cv.height = H * dpr;
        cv.style.width = W + "px"; cv.style.height = H + "px";
      }
      atmoCv.width = W * aDpr; atmoCv.height = H * aDpr;
      atmoCv.style.width = W + "px"; atmoCv.style.height = H + "px";
      ax.setTransform(aDpr, 0, 0, aDpr, 0, 0);
      bx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      thread.build(W, H);
      atmo.build(W, H);

      if (wordmark) {
        const wm = wordmark.getBoundingClientRect();
        const wr = wrap.getBoundingClientRect();
        const wf = (wm.top - wr.top + wm.height / 2) / H;
        const wTop = (wm.top - wr.top) / H;
        MODES.strand.restY = Math.min(0.82, wf + 0.2);
        MODES.woven.restY = Math.max(0.16, wTop - 0.05); // rest a little ABOVE the headline, not sagging through it
        MODES.dusk.restY = Math.min(0.86, wf + 0.32);
      }
    }
    size();
    window.addEventListener("resize", size);
    // a late web-font swap reflows the letters after our first measure — mark
    // the centres stale so the next 30Hz tick re-reads them.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => { measurePending = true; });
    }

    function onMove(e: PointerEvent) {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x >= 0 && x <= r.width && y >= 0 && y <= r.height) {
        mouse.x = x; mouse.y = y; mouse.active = true;
        atmo.setLantern(x, y);
      } else {
        mouse.active = false;
      }
    }
    if (finePointer && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    // measure every letter centre into wrap-local space, once. The values stay
    // valid while the page scrolls (letters and wrap move together) and across
    // modes (woven applies no wordmark transform) — only resize / reflow
    // invalidates them, which flips measurePending back on.
    function measureLetters() {
      const wr = wrap.getBoundingClientRect();
      for (let i = 0; i < letters.length; i++) {
        const r = letters[i].getBoundingClientRect();
        cxs[i] = r.left - wr.left + r.width / 2;
        cys[i] = r.top - wr.top + r.height / 2;
      }
    }

    function paintLetters(dt: number) {
      // dusk parallax offsets the whole wordmark; fold the same offset into the
      // cached centres so warming stays aligned without re-reading the DOM.
      let px = 0, py = 0;
      if (wordmark) {
        if (cur.parallax > 0.7 && mouse.active) {
          px = (mouse.x / W - 0.5) * -18 * cur.parallax;
          py = (mouse.y / H - 0.5) * -11 * cur.parallax;
          wordmark.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
        } else {
          wordmark.style.transform = "";
        }
      }

      for (let i = 0; i < letters.length; i++) {
        const l = letters[i];
        const cx = cxs[i] + px, cy = cys[i] + py;

        let w = 0;
        if (mouse.active) {
          const d = Math.hypot(cx - mouse.x, cy - mouse.y);
          w = Math.max(w, Math.max(0, 1 - d / 240));
        }
        if (cur.weave > 0.2) {
          let best = 1e9;
          for (let j = 0; j < thread.points.length; j += 2) {
            const p = thread.points[j];
            const d = Math.hypot(cx - p.x, cy - p.y);
            if (d < best) best = d;
          }
          w = Math.max(w, Math.max(0, 1 - best / 90) * cur.weave);
        }
        const prev = warm.get(l) ?? 0;
        const next = prev + (w - prev) * Math.min(1, dt * (w > prev ? 12 : 3));
        warm.set(l, next);
        l.style.color = mix(CREAM, GOLD, next);
      }
    }

    function drawWeave() {
      fx.clearRect(0, 0, W, H);
      if (cur.weave < 0.05) return;
      const pts = thread.points;
      const period = W / 6.5;
      let run: typeof pts = [];
      const flush = () => {
        if (run.length >= 2) {
          thread.alpha = cur.threadAlpha * cur.weave;
          thread.draw(fx, GOLD, run);
        }
        run = [];
      };
      for (const p of pts) {
        const over = Math.floor((p.x + period * 0.5) / period) % 2 === 0;
        if (over) run.push(p); else flush();
      }
      flush();
    }

    function drawBead(dt: number) {
      if (cur.bead < 0.05 || thread.points.length < 2) return;
      beadF = (beadF + dt * 0.05) % 1;
      const p = thread.at(beadF);
      bx.save();
      bx.globalCompositeOperation = "lighter";
      // halo via stacked translucent fills instead of shadowBlur
      bx.globalAlpha = cur.bead * 0.22;
      bx.fillStyle = GOLD;
      bx.beginPath(); bx.arc(p.x, p.y, 10, 0, Math.PI * 2); bx.fill();
      bx.globalAlpha = cur.bead * 0.5;
      bx.beginPath(); bx.arc(p.x, p.y, 5, 0, Math.PI * 2); bx.fill();
      bx.globalAlpha = cur.bead;
      bx.fillStyle = "#f4e6c2";
      bx.beginPath(); bx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); bx.fill();
      bx.restore();
    }

    function morph(dt: number) {
      const tgt = MODES[modeRef.current];
      const k = Math.min(1, dt * 2.4);
      (Object.keys(tgt) as (keyof Preset)[]).forEach((key) => {
        cur[key] += (tgt[key] - cur[key]) * k;
      });
      thread.restY = cur.restY; thread.sag = cur.sag; thread.width = cur.width;
      thread.glow = cur.glow; thread.alpha = cur.threadAlpha; thread.gravity = cur.grav;
      thread.mouseForce = cur.mouseForce; thread.wander = cur.wander;
      atmo.intensity = cur.lanternInt; atmo.moteAlpha = cur.moteAlpha;
    }

    function step(dt: number) {
      morph(dt);

      // drop-in bounce: override the (settled) rest line with a raised-then-
      // bouncing one until the intro completes, then hand back to morph.
      if (introT < INTRO_DUR) {
        introT += dt;
        const p = Math.min(1, introT / INTRO_DUR);
        thread.restY = introFromRestY + (cur.restY - introFromRestY) * easeOutBounce(p);
      }

      // atmosphere is slow-moving (drifting motes + breathing glows) — update &
      // repaint it at ~30Hz on its own canvas. The last frame simply persists
      // between ticks (we don't clear it), halving the heaviest fill work.
      atmoAcc += dt;
      if (atmoAcc >= ATMO_DT) {
        if (!mouse.active) {
          autoT += atmoAcc;
          atmo.setLantern(
            W * (0.5 + 0.32 * Math.sin(autoT * 0.25)),
            H * (0.4 + 0.2 * Math.cos(autoT * 0.19))
          );
        }
        atmo.update(atmoAcc);
        ax.clearRect(0, 0, W, H);
        atmo.draw(ax);
        atmoAcc = 0;
      }

      // the strand runs at full frame rate so it stays crisp under the cursor
      thread.update(dt, mouse);
      bx.clearRect(0, 0, W, H);
      thread.alpha = cur.threadAlpha;
      thread.draw(bx, GOLD);
      drawBead(dt);

      drawWeave();

      // warm the letters at ~30Hz, not every frame. Defer the first measure
      // until the intro letters have settled (their rects move during it), then
      // re-measure only when resize/fonts mark the centres stale.
      warmAcc += dt;
      if (warmAcc >= WARM_DT) {
        if (measurePending && introT >= INTRO_DUR) {
          measureLetters();
          measurePending = false;
        }
        paintLetters(warmAcc);
        warmAcc = 0;
      }
    }

    function frame(now: number) {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;
      // on lite (touch/small) devices, coalesce to ~30fps: accumulate skipped
      // time and step once with the summed dt so motion stays time-correct.
      if (lite) {
        frameAcc += dt;
        if (frameAcc < LITE_DT) {
          if (running) raf = requestAnimationFrame(frame);
          return;
        }
        dt = frameAcc;
        frameAcc = 0;
        if (dt > 0.05) dt = 0.05;
      }
      step(dt);
      if (running) raf = requestAnimationFrame(frame);
    }

    // run the loop only while it can be seen — paused offscreen / when hidden
    function startLoop() {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    if (reduce) {
      Object.assign(cur, MODES[modeRef.current], { threadAlpha: MODES[modeRef.current].threadAlpha });
      morph(1);
      for (let i = 0; i < 60; i++) thread.update(0.016, { x: 0, y: 0, active: false });
      atmo.update(0.1);
      atmo.draw(ax);
      thread.draw(bx, GOLD);
      drawWeave();
      letters.forEach((l) => (l.style.color = CREAM));
    } else {
      // "thrown from a small height": seat every point on a raised line so the
      // first painted frame is already composed up top, then let step() drop
      // and bounce it down into place. (No pre-settle — the drop IS the intro.)
      introFromRestY = Math.max(0.04, MODES[modeRef.current].restY - INTRO_DROP);
      thread.restY = introFromRestY;
      thread.build(W, H);
      startLoop();

      // Burn frames only while the hero is actually on screen and the tab is
      // visible — frees CPU/GPU the instant you scroll past, with no change to
      // what you see while it's in view. (Guarded for very old browsers without
      // IntersectionObserver — there the loop simply runs as before.)
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            onScreen = entries[0].isIntersecting;
            if (onScreen && !document.hidden) startLoop();
            else stopLoop();
          },
          { rootMargin: "200px" }
        );
        io.observe(wrap);
      }
      onVis = () => {
        if (document.hidden) stopLoop();
        else if (onScreen) startLoop();
      };
      document.addEventListener("visibilitychange", onVis);
    }

    return () => {
      stopLoop();
      io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      letters.forEach((l) => { l.style.color = ""; });
      if (wordmark) wordmark.style.transform = "";
    };
  }, [letterSelector, wordmarkSelector]);

  return (
    <>
      {/* back: atmosphere + the strand, behind the wordmark (z0/z1) */}
      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <canvas ref={atmoRef} style={{ position: "absolute", inset: 0 }} />
        <canvas ref={backRef} style={{ position: "absolute", inset: 0 }} />
      </div>
      {/* front: the woven "over" strokes, above the wordmark text (z20).
          Must be a sibling of the back layer, NOT nested, so it outranks the
          content layer (give the hero content `position: relative; z-10`). */}
      <canvas
        ref={frontRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}
      />
    </>
  );
}
