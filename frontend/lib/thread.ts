/* InnoCooks — the Thread, as a real verlet-integrated strand.
 * Gravity + distance constraints give it body and weight; it hangs in a
 * catenary, sways on an ambient breeze, and recoils from the cursor.
 * Rendered in stacked passes (wide bloom -> core -> highlight) so it reads
 * as a glowing material strand, not a 1px line.
 *
 * Framework-agnostic: no DOM, no React. Drive it from HeroCanvas. */

export interface ThreadOpts {
  count?: number;
  gravity?: number;
  stiffness?: number;
  damping?: number;
  iterations?: number;
  restY?: number;
  sag?: number;
  width?: number;
  glow?: number;
  alpha?: number;
  mouseRadius?: number;
  mouseForce?: number;
  wander?: number;
}

export interface Pt {
  x: number; y: number; px: number; py: number; pinned: boolean;
}

export interface Mouse { x: number; y: number; active: boolean; }

export class VerletThread {
  count: number;
  gravity: number;
  stiffness: number;
  damping: number;
  iterations: number;
  restY: number;
  sag: number;
  width: number;
  glow: number;
  alpha: number;
  mouseRadius: number;
  mouseForce: number;
  wander: number;
  points: Pt[] = [];
  segLen = 0;
  t = 0;
  W = 0;
  H = 0;

  constructor(opts: ThreadOpts = {}) {
    this.count = opts.count ?? 48;
    this.gravity = opts.gravity ?? 760;
    this.stiffness = opts.stiffness ?? 1;
    this.damping = opts.damping ?? 0.992;
    this.iterations = opts.iterations ?? 14;
    this.restY = opts.restY ?? 0.56;
    this.sag = opts.sag ?? 150;
    this.width = opts.width ?? 6;
    this.glow = opts.glow ?? 1;
    this.alpha = opts.alpha ?? 1;
    this.mouseRadius = opts.mouseRadius ?? 170;
    this.mouseForce = opts.mouseForce ?? 1;
    this.wander = opts.wander ?? 26;
  }

  build(W: number, H: number) {
    this.W = W;
    this.H = H;
    const ay = H * this.restY;
    this.segLen = (W * 1.06) / (this.count - 1);
    this.points = [];
    for (let i = 0; i < this.count; i++) {
      const f = i / (this.count - 1);
      const x = -W * 0.03 + f * W * 1.06;
      const y = ay + Math.sin(f * Math.PI) * this.sag * 0.4;
      this.points.push({ x, y, px: x, py: y, pinned: i === 0 || i === this.count - 1 });
    }
  }

  update(dt: number, mouse: Mouse) {
    this.t += dt;
    const g = this.gravity * dt * dt;
    const breeze =
      Math.sin(this.t * 0.6) * this.wander +
      Math.sin(this.t * 1.7 + 1.3) * this.wander * 0.4;

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (p.pinned) continue;
      const vx = (p.x - p.px) * this.damping;
      const vy = (p.y - p.py) * this.damping;
      p.px = p.x;
      p.py = p.y;
      p.x += vx + breeze * dt;
      p.y += vy + g;

      if (mouse && mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        const r = this.mouseRadius;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 1;
          const fall = 1 - d / r;
          const push = fall * fall * 34 * this.mouseForce;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }
      }
    }

    const target = this.segLen;
    for (let k = 0; k < this.iterations; k++) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const a = this.points[i];
        const b = this.points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = ((d - target) / d) * 0.5 * this.stiffness;
        const ox = dx * diff;
        const oy = dy * diff;
        if (!a.pinned) { a.x += ox; a.y += oy; }
        if (!b.pinned) { b.x -= ox; b.y -= oy; }
      }
      const ay = this.H * this.restY;
      const first = this.points[0];
      const last = this.points[this.points.length - 1];
      first.x = -this.W * 0.03; first.y = ay;
      last.x = this.W * 1.03; last.y = ay;
    }
  }

  private buildPath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    const n = pts.length;
    ctx.quadraticCurveTo(pts[n - 2].x, pts[n - 2].y, pts[n - 1].x, pts[n - 1].y);
  }

  draw(ctx: CanvasRenderingContext2D, gold = "#c9a55c", pts: Pt[] = this.points) {
    if (pts.length < 2 || this.alpha <= 0.001) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // glow is built from stacked translucent strokes (widest = faintest) drawn
    // additively — NO canvas shadowBlur, which is the single most expensive
    // per-frame canvas op. Visually this reads as the same gold bloom.
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = gold;

    ctx.globalAlpha = 0.09 * this.alpha * this.glow;
    ctx.lineWidth = this.width * 5;
    this.buildPath(ctx, pts); ctx.stroke();

    ctx.globalAlpha = 0.16 * this.alpha * this.glow;
    ctx.lineWidth = this.width * 2.6;
    this.buildPath(ctx, pts); ctx.stroke();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = this.width;
    this.buildPath(ctx, pts); ctx.stroke();

    ctx.globalAlpha = 0.55 * this.alpha;
    ctx.strokeStyle = "#f4e6c2";
    ctx.lineWidth = Math.max(1, this.width * 0.32);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y - this.width * 0.22);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2 - this.width * 0.22;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y - this.width * 0.22, xc, yc);
    }
    ctx.stroke();
    ctx.restore();
  }

  at(f: number) {
    const n = this.points.length;
    // strand not built yet (or torn during a hot-reload): hand back a safe
    // point on the rest line instead of indexing into an empty array.
    if (n < 2) return { x: this.W / 2, y: this.H * this.restY };
    // clamp the sample fraction so a stray non-finite value can never produce
    // a NaN index (points[NaN] === undefined -> "reading 'x'" crash).
    const fc = Number.isFinite(f) ? Math.max(0, Math.min(1, f)) : 0;
    const i = Math.max(0, Math.min(n - 2, Math.floor(fc * (n - 1))));
    const a = this.points[i];
    const b = this.points[i + 1];
    const local = fc * (n - 1) - i;
    return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
  }
}
