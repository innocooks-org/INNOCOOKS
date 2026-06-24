"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

const ORANGE = "#c45b35";
const BLUE = "#2bb6ff";

type Pt = { x: number; y: number; node?: boolean; el?: HTMLElement };

export default function RibbonField({
  children,
  intensity = 1,
}: {
  children: ReactNode;
  intensity?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const probeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const probe = probeRef.current;
    if (!root || !svg || !probe) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodeProg: { el: HTMLElement; p: number }[] = [];
    let flipState: (boolean | null)[] = [];
    let ticking = false;

    const center = (el: Element, rootRect: DOMRect): Pt => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - rootRect.left + r.width / 2,
        y: r.top - rootRect.top + r.height / 2,
        el: el as HTMLElement,
      };
    };

    const buildPath = (pts: Pt[]) => {
      if (pts.length < 2) return { d: "", snaps: [] as { el?: HTMLElement; d: string }[] };
      let d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
      const snaps: { el?: HTMLElement; d: string }[] = [];

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        if (p2.node) snaps.push({ el: p2.el, d });
      }

      return { d, snaps };
    };

    const pointsFor = (origin: Pt, nodes: Pt[], end: Pt, W: number, startLeft: boolean): Pt[] => {
      const pts: Pt[] = [{ x: origin.x, y: origin.y }];
      let left = startLeft;

      nodes.forEach((n) => {
        const prev = pts[pts.length - 1];
        const gap = n.y - prev.y;

        if (gap > 280) {
          const lSide = W * 0.28;
          const rSide = W * 0.72;
          const swing = left ? lSide : rSide;
          const cross = left ? rSide : lSide;

          pts.push({ x: swing, y: prev.y + gap * 0.38 });
          if (gap > 900) {
            pts.push({ x: cross, y: prev.y + gap * 0.62 });
          }
          left = !left;
        }

        pts.push({ x: n.x, y: n.y, node: true, el: n.el });
      });

      pts.push({ x: end.x, y: end.y });
      return pts;
    };

    const lenOf = (d: string) => {
      probe.setAttribute("d", d);
      try {
        return probe.getTotalLength();
      } catch {
        return 0;
      }
    };

    const measure = () => {
      const W = root.clientWidth;
      const H = root.scrollHeight;
      if (!W || !H) return;

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const rootRect = root.getBoundingClientRect();
      const originEl = root.querySelector("[data-ribbon-origin]");
      const sharedEndEl = root.querySelector("[data-ribbon-end]");
      const orangeEndEl = root.querySelector("[data-ribbon-end-orange]") || sharedEndEl;
      const blueEndEl = root.querySelector("[data-ribbon-end-blue]") || sharedEndEl;
      const kwEls = Array.from(root.querySelectorAll<HTMLElement>("[data-ribbon-kw]"));
      if (!originEl || !kwEls.length) return;

      const origin = center(originEl, rootRect);
      const fallbackEnd = { x: W / 2, y: H };
      const orangeEnd = orangeEndEl ? center(orangeEndEl, rootRect) : fallbackEnd;
      const blueEnd = blueEndEl ? center(blueEndEl, rootRect) : fallbackEnd;

      // keywords tagged "O" go only to orange, "B" only to blue, untagged go to both
      const oNodes = kwEls
        .filter((el) => el.dataset.ribbonKw !== "B")
        .map((el) => center(el, rootRect))
        .sort((a, b) => a.y - b.y);
      const bNodes = kwEls
        .filter((el) => el.dataset.ribbonKw !== "O")
        .map((el) => center(el, rootRect))
        .sort((a, b) => a.y - b.y);

      const oPath = buildPath(pointsFor(origin, oNodes, orangeEnd, W, true));
      const bPath = buildPath(pointsFor(origin, bNodes, blueEnd, W, false));

      svg.querySelectorAll("[data-ribbon='O']").forEach((p) => p.setAttribute("d", oPath.d));
      svg.querySelectorAll("[data-ribbon='B']").forEach((p) => p.setAttribute("d", bPath.d));

      const totalO = lenOf(oPath.d);
      const totalB = lenOf(bPath.d);
      svg.style.setProperty("--lenO", String(Math.ceil(totalO || 99999)));
      svg.style.setProperty("--lenB", String(Math.ceil(totalB || 99999)));

      nodeProg = bPath.snaps.map((s) => ({
        el: s.el!,
        p: totalB ? Math.max(0, lenOf(s.d) / totalB - 0.012) : 1,
      }));
      flipState = nodeProg.map(() => null);
    };

    const applyFlips = (pb: number) => {
      for (let i = 0; i < nodeProg.length; i++) {
        const on = pb >= nodeProg[i].p;
        if (flipState[i] === on) continue;
        flipState[i] = on;
        const el = nodeProg[i].el;

        if (on) {
          el.style.color = BLUE;
          el.style.textShadow = "0 0 22px rgba(43,182,255,.55)";
        } else {
          el.style.color = ORANGE;
          el.style.textShadow = "none";
        }
      }
    };

    const setVars = (po: number, pb: number) => {
      svg.style.setProperty("--po", po.toFixed(4));
      svg.style.setProperty("--pb", pb.toFixed(4));
      svg.style.setProperty("--glow", String(intensity));
    };

    const update = () => {
      const se = document.scrollingElement || document.documentElement;
      const sH = se.scrollHeight;
      const vH = se.clientHeight || window.innerHeight;
      const sTop = Math.max(0, se.scrollTop || window.scrollY || 0);
      
      if (sTop > 5 && root) {
        root.classList.add("is-scrolled");
      }

      // raw 0→1 = raw scroll fraction
      const raw = Math.min(1, sTop / (sH - vH || 1));
      // footer boost: kicks in around the FinalCTA / "slowing" keyword,
      // then the last stretch completes at 3× speed toward the INNOCOOKS watermark
      const BOOST = 0.88;
      const g = raw < BOOST
        ? raw
        : Math.min(1, BOOST + (raw - BOOST) * 3.0);
      const po = g;
      const pb = Math.max(0, Math.min(1, (g - 0.03) / 0.92));
      setVars(po, pb);
      applyFlips(pb);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      }
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    if (reduce) {
      setVars(1, 1);
      applyFlips(1);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      update();
    }

    let t: number | undefined;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        update();
      });
    }
    t = window.setTimeout(() => {
      measure();
      update();
    }, 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (t) clearTimeout(t);
    };
  }, [intensity]);

  const ribbon = (
    key: "O" | "B",
    lenVar: string,
    pVar: string,
    c: { glow: string; mid: string; edge: string; core: string; hot: string; head: string },
  ) => {
    const base = (w: number, stroke: string, op: string) => ({
      stroke,
      strokeWidth: w,
      strokeOpacity: op,
      strokeDasharray: `var(${lenVar},99999)`,
      strokeDashoffset: `calc(var(${lenVar},99999) * (1 - var(${pVar},0)))`,
    });
    const head = (w: number, stroke: string, op: string, dash: string, cap?: "round" | "butt" | "square") => ({
      stroke,
      strokeWidth: w,
      strokeOpacity: op,
      strokeDasharray: dash,
      strokeDashoffset: `calc(var(${lenVar},99999) * 1px * (0 - var(${pVar},0)))`,
      ...(cap && { strokeLinecap: cap }),
    });
    const common = {
      fill: "none" as const,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      vectorEffect: "non-scaling-stroke" as const,
    };
    const specs = [
      // ── smooth Gaussian glow falloff - 6 layers wide→tight ──
      base(64, c.glow, "calc(.020 * var(--glow,1))"),   // far ambient
      base(44, c.glow, "calc(.038 * var(--glow,1))"),
      base(28, c.glow, "calc(.068 * var(--glow,1))"),
      base(16, c.mid,  "calc(.115 * var(--glow,1))"),
      base(10, c.mid,  "calc(.200 * var(--glow,1))"),
      // ── dark edge shadow - Tron inner/outer-edge look ────────
      base(8,  c.edge, "0.42"),
      // ── ribbon body ──────────────────────────────────────────
      base(4.5,c.core, "0.78"),
      base(1.8,c.hot,  "0.95"),
      base(0.7,c.head, "1"),
      
      // ── moving tip: Combined Twin Engine + Tapered Comet ──────
      // 1. Twin Engine Split (Front 36px)
      head(24, c.core, "calc(.7 * var(--glow,1))", "36 999999", "butt"), 
      head(14, c.edge, "1", "36 999999", "butt"),                      
      head(24, c.head, "1", "6 999999", "butt"),                         
      head(6, "#ffffff", "1", "2 999999", "butt"),                       

      // 2. Tapered Comet Tail (Starts 18px behind the front, tucked inside the engine)
      {
        stroke: c.core,
        strokeWidth: 20,
        strokeOpacity: "calc(.5 * var(--glow,1))",
        strokeDasharray: "24 8 14 6 8 999999",
        strokeDashoffset: `calc(var(${lenVar},99999) * 1px * (0 - var(${pVar},0)) + 18px)`,
        strokeLinecap: "round",
      },
      {
        stroke: c.head,
        strokeWidth: 8,
        strokeOpacity: "0.9",
        strokeDasharray: "18 12 10 999999",
        strokeDashoffset: `calc(var(${lenVar},99999) * 1px * (0 - var(${pVar},0)) + 18px)`,
        strokeLinecap: "round",
      }
    ];

    return specs.map((s, i) => (
      <path key={key + i} data-ribbon={key} d="" {...common}
        style={s as CSSProperties} />
    ));
  };

  return (
    <div ref={rootRef} className="ribbon-field" style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        className="ribbon-svg"
        aria-hidden="true"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <path ref={probeRef} d="" fill="none" style={{ visibility: "hidden" }} />
        {ribbon("O", "--lenO", "--po", {
          glow: "#b84f2c",   // deep orange ambient
          mid:  "#d96840",   // warmer halo
          edge: "#090402",   // near-black edge shadow (Tron inner/outer line)
          core: "#ff8a52",   // vivid orange body
          hot:  "#ffc8a0",   // near-white bright centre
          head: "#fff0e8",   // specular tip
        })}
        {ribbon("B", "--lenB", "--pb", {
          glow: "#104e82",   // deep blue ambient
          mid:  "#1e88e5",   // electric blue halo
          edge: "#010408",   // near-black edge shadow (blue-tinted)
          core: "#4fc3f7",   // bright cyan body
          hot:  "#b3e5fc",   // near-white bright centre
          head: "#e1f5fe",   // specular tip
        })}
      </svg>
      <div className="ribbon-content" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
