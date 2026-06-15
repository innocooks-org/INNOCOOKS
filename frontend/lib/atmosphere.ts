/* InnoCooks — Atmosphere. The dusk the Thread hangs in.
 * A lantern of gold light that lags behind the cursor, slow-drifting dust
 * motes at three parallax depths, and two ambient glow fields.
 *
 * Performance: every glow is a small radial sprite rendered ONCE to an
 * offscreen canvas and stamped with drawImage — no per-frame createRadial
 * gradient, no full-canvas gradient fills, and no canvas shadowBlur (both are
 * the heavy ops). One canvas, additive, cheap. Framework-agnostic. */

interface Mote {
  x: number; y: number; r: number; depth: number;
  drift: number; rise: number; tw: number; tws: number;
}

function radialSprite(rgb: string, size = 128): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${rgb},1)`);
  grd.addColorStop(0.5, `rgba(${rgb},0.35)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

export class Atmosphere {
  W = 0;
  H = 0;
  motes: Mote[] = [];
  lantern = { x: 0, y: 0, tx: 0, ty: 0 };
  intensity = 1;
  moteAlpha = 1;
  t = 0;

  private gold?: HTMLCanvasElement;
  private indigo?: HTMLCanvasElement;
  private cream?: HTMLCanvasElement;
  private mote?: HTMLCanvasElement;

  build(W: number, H: number) {
    this.W = W;
    this.H = H;
    if (!this.lantern.x) { this.lantern.x = W * 0.7; this.lantern.y = H * 0.4; }
    // a touch fewer motes than before — they read the same, cost less
    const target = Math.min(70, Math.round((W * H) / 38000));
    this.motes = [];
    for (let i = 0; i < target; i++) this.motes.push(this.makeMote(true));

    // build the sprites once (idempotent)
    if (!this.gold) {
      this.gold = radialSprite("201,165,92");
      this.indigo = radialSprite("74,68,160");
      this.cream = radialSprite("244,230,194");
      this.mote = radialSprite("220,205,160", 48);
    }
  }

  private makeMote(scatter: boolean): Mote {
    const depth = Math.random();
    return {
      x: Math.random() * this.W,
      y: scatter ? Math.random() * this.H : this.H + 20,
      r: 0.5 + depth * 1.8,
      depth,
      drift: (Math.random() - 0.5) * 8,
      rise: 6 + depth * 22,
      tw: Math.random() * Math.PI * 2,
      tws: 0.6 + Math.random() * 1.2,
    };
  }

  setLantern(x: number, y: number) { this.lantern.tx = x; this.lantern.ty = y; }

  update(dt: number) {
    this.t += dt;
    this.lantern.x += (this.lantern.tx - this.lantern.x) * Math.min(1, dt * 3.2);
    this.lantern.y += (this.lantern.ty - this.lantern.y) * Math.min(1, dt * 3.2);

    for (const m of this.motes) {
      m.y -= m.rise * dt;
      m.x += Math.sin(this.t * 0.4 + m.tw) * m.drift * dt;
      m.tw += dt * m.tws;
      if (m.y < -20) Object.assign(m, this.makeMote(false));
    }
  }

  private blit(ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement, cx: number, cy: number, d: number, alpha: number) {
    if (alpha <= 0.001) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, cx - d / 2, cy - d / 2, d, d);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gold) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const breath = 0.85 + Math.sin(this.t * 0.5) * 0.15;

    // ambient glow fields (static positions)
    this.blit(ctx, this.gold, this.W * 0.78, this.H * 0.12, this.W, 0.1 * this.intensity * breath);
    this.blit(ctx, this.indigo!, this.W * 0.12, this.H * 0.82, this.W * 0.9, 0.16 * breath);

    // lantern (follows the cursor)
    if (this.intensity > 0.01) {
      this.blit(ctx, this.gold, this.lantern.x, this.lantern.y, this.W * 0.72 + Math.sin(this.t) * 16, 0.13 * this.intensity);
      this.blit(ctx, this.cream!, this.lantern.x, this.lantern.y, this.W * 0.28, 0.1 * this.intensity);
    }

    // dust motes (sprite-stamped, no shadow)
    if (this.moteAlpha > 0.01 && this.mote) {
      for (const m of this.motes) {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(m.tw));
        const a = tw * (0.12 + m.depth * 0.5) * this.moteAlpha;
        const px = m.x + (this.lantern.x - this.W / 2) * m.depth * 0.02;
        this.blit(ctx, this.mote, px, m.y, m.r * 7, a);
      }
    }
    ctx.restore();
  }
}
