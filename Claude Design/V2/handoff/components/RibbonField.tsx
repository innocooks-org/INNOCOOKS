'use client';

/**
 * RibbonField — two Tron light-ribbons (orange + neon blue) that draw on scroll
 * behind the page content, threading through marked keywords. As the blue
 * ribbon's leading edge reaches an orange keyword, that word converts to blue.
 *
 * Drop-in: wrap your page content with <RibbonField> … </RibbonField>.
 *
 * Mark ANY keyword to connect + convert:   <span data-ribbon-kw>systems</span>
 * Mark the ribbon origin (e.g. scroll hint): <div data-ribbon-origin />
 * Mark the end point (optional, defaults to bottom): <div data-ribbon-end />
 *
 * Performance: paths are built ONCE per layout (mount / resize / font-load).
 * Scrolling only updates two CSS custom properties — no per-frame geometry.
 */

import { useEffect, useRef } from 'react';

const ORANGE = '#c45b35';
const BLUE = '#2bb6ff';

type Pt = { x: number; y: number; node?: boolean; el?: HTMLElement };

export default function RibbonField({
  children,
  intensity = 1,
}: {
  children: React.ReactNode;
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

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    // Catmull-Rom -> rounded cubic bezier; record partial path at each keyword
    const buildPath = (pts: Pt[]) => {
      if (pts.length < 2) return { d: '', snaps: [] as { el?: HTMLElement; d: string }[] };
      let d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
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

    // origin -> (margin waypoint -> keyword)* -> end. Waypoints swing to
    // alternating margins so the two ribbons braid between words and converge
    // on each keyword.
    const pointsFor = (origin: Pt, nodes: Pt[], end: Pt, W: number, startLeft: boolean): Pt[] => {
      const pts: Pt[] = [{ x: origin.x, y: origin.y }];
      let left = startLeft;
      for (const n of nodes) {
        const prev = pts[pts.length - 1];
        if (n.y - prev.y > 280) {
          pts.push({ x: left ? W * 0.13 : W * 0.87, y: (prev.y + n.y) / 2 });
          left = !left;
        }
        pts.push({ x: n.x, y: n.y, node: true, el: n.el });
      }
      pts.push({ x: end.x, y: end.y });
      return pts;
    };

    const lenOf = (d: string) => {
      probe.setAttribute('d', d);
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
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const rootRect = root.getBoundingClientRect();

      const originEl = root.querySelector('[data-ribbon-origin]');
      const endEl = root.querySelector('[data-ribbon-end]');
      const kwEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ribbon-kw]'));
      if (!originEl || !kwEls.length) return;

      const origin = center(originEl, rootRect);
      const end = endEl ? center(endEl, rootRect) : { x: W / 2, y: H };
      const nodes = kwEls.map((el) => center(el, rootRect)).sort((a, b) => a.y - b.y);

      const oPath = buildPath(pointsFor(origin, nodes, end, W, true));
      const bPath = buildPath(pointsFor(origin, nodes, end, W, false));

      svg.querySelectorAll('[data-ribbon="O"]').forEach((p) => p.setAttribute('d', oPath.d));
      svg.querySelectorAll('[data-ribbon="B"]').forEach((p) => p.setAttribute('d', bPath.d));

      const totalO = lenOf(oPath.d);
      const totalB = lenOf(bPath.d);
      svg.style.setProperty('--lenO', String(Math.ceil(totalO || 99999)));
      svg.style.setProperty('--lenB', String(Math.ceil(totalB || 99999)));

      // blue progress threshold per keyword (slightly early so the flip lands
      // as the wall sweeps over the word)
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
          el.style.textShadow = '0 0 22px rgba(43,182,255,.55)';
        } else {
          el.style.color = ORANGE;
          el.style.textShadow = 'none';
        }
      }
    };

    const setVars = (po: number, pb: number) => {
      svg.style.setProperty('--po', po.toFixed(4));
      svg.style.setProperty('--pb', pb.toFixed(4));
      svg.style.setProperty('--glow', String(intensity));
    };

    const update = () => {
      const se = document.scrollingElement || document.documentElement;
      const denom = se.scrollHeight - se.clientHeight || 1;
      const top = se.scrollTop || window.scrollY || 0;
      const g = Math.max(0, Math.min(1, top / denom));
      const po = g; // orange leads
      const pb = Math.max(0, Math.min(1, (g - 0.05) / 0.9)); // blue follows + converts
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
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (t) clearTimeout(t);
    };
  }, [intensity]);

  // one reusable stroke spec -> stacked translucent strokes (wide glow -> hot
  // core) + a bright moving "light-cycle head".
  const ribbon = (key: 'O' | 'B', lenVar: string, pVar: string, c: { glow: string; mid: string; core: string; hot: string; head: string }) => {
    const base = (w: number, stroke: string, op: string) => ({
      stroke,
      strokeWidth: w,
      strokeOpacity: op,
      strokeDasharray: `var(${lenVar},99999)`,
      strokeDashoffset: `calc(var(${lenVar},99999) * (1 - var(${pVar},0)))`,
    });
    const head = (w: number, stroke: string, op: string, dash: string) => ({
      stroke,
      strokeWidth: w,
      strokeOpacity: op,
      strokeDasharray: dash,
      strokeDashoffset: `calc(var(${lenVar},99999) * (0 - var(${pVar},0)))`,
    });
    const common = {
      fill: 'none' as const,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      vectorEffect: 'non-scaling-stroke' as const,
    };
    const specs = [
      base(40, c.glow, 'calc(.05 * var(--glow,1))'),
      base(22, c.glow, 'calc(.10 * var(--glow,1))'),
      base(9, c.mid, 'calc(.25 * var(--glow,1))'),
      base(4, c.core, '0.73'),
      base(1.7, c.hot, '1'),
      head(17, c.core, 'calc(.45 * var(--glow,1))', '64 999999'),
      head(5.5, c.head, '1', '30 999999'),
    ];
    return specs.map((s, i) => <path key={key + i} data-ribbon={key} d="" {...common} style={s as React.CSSProperties} />);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        aria-hidden="true"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      >
        <path ref={probeRef} d="" fill="none" style={{ visibility: 'hidden' }} />
        {ribbon('O', '--lenO', '--po', { glow: '#c45b35', mid: '#e8794a', core: '#ff8a52', hot: '#ffe1d2', head: '#fff4ec' })}
        {ribbon('B', '--lenB', '--pb', { glow: '#1f7fb8', mid: '#2bb6ff', core: '#5fccff', hot: '#dff4ff', head: '#eaf8ff' })}
      </svg>
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </div>
  );
}
