import { NextRequest, NextResponse } from "next/server";

/* ─── IP rate limit (server-side, secondary guard) ──────────────────────────
   In-memory Map - resets on cold start, which is intentional: this is a
   backstop against burst abuse. The client-side localStorage check (3 per 24h
   per device) is the primary per-user enforcement layer.
   Vercel spins up multiple lambdas under load; each has its own Map, so this
   is best-effort DDoS mitigation, not a hard cap. For hard caps add Vercel KV. */
const ipStore = new Map<string, number[]>();
const IP_LIMIT      = 10;
const IP_WINDOW_MS  = 60 * 60 * 1000; // 1 hour

function ipAllowed(ip: string): boolean {
  const now   = Date.now();
  const prior = (ipStore.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (prior.length >= IP_LIMIT) return false;
  ipStore.set(ip, [...prior, now]);
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Origins that are allowed to POST here. Server-rendered requests (SSR) have
   no Origin header so we allow null. Anything else is rejected.
   NEXT_PUBLIC_SITE_URL can be a single URL or a comma-separated list of URLs
   e.g. "https://innocooks.hacksters.tech,https://innocooks.com" */
const extraOrigins = (process.env.NEXT_PUBLIC_SITE_URL ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = new Set<string | null>([
  "https://innocooks.com",
  "https://www.innocooks.com",
  ...extraOrigins,
  "http://localhost:3000",
  "http://localhost:3001",
  null,           // same-origin server-rendered forms
]);

export async function POST(req: NextRequest) {

  // ── CSRF: only our own origins may POST ───────────────────────────────────
  const origin = req.headers.get("origin");
  console.log("[contact] origin=%s allowed=%s set=%s", origin, ALLOWED_ORIGINS.has(origin), [...ALLOWED_ORIGINS].join("|"));
  if (!ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // ── IP rate limit ─────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!ipAllowed(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Sanitise + hard-cap all string lengths before any processing
  const name     = String(body.name     ?? "").trim().slice(0, 200);
  const email    = String(body.email    ?? "").trim().slice(0, 200);
  const business = String(body.business ?? "").trim().slice(0, 300);
  const budget   = String(body.budget   ?? "").trim().slice(0, 50);
  const message  = String(body.message  ?? "").trim().slice(0, 5000);
  const openedAt = Number(body.openedAt ?? 0);

  // ── Minimum-time bot check ────────────────────────────────────────────────
  // A real human needs at least 3 s to fill five fields; instant submits are bots.
  // We return 200 (not 400) so the bot gets no signal that it was dropped.
  if (Date.now() - openedAt < 3000) {
    return NextResponse.json({ ok: true });
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!name)
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!email || !EMAIL_RE.test(email))
    return NextResponse.json({ error: "Please add a valid email so we can reply." }, { status: 400 });
  if (message.length < 10)
    return NextResponse.json({ error: "Tell us a little more. What do you need?" }, { status: 400 });

  // ── Send via EmailJS REST API ─────────────────────────────────────────────
  // Keys live in server-only env vars (no NEXT_PUBLIC_ prefix) - they never
  // reach the browser bundle.
  const serviceId        = process.env.EMAILJS_SERVICE_ID          ?? "";
  const templateId       = process.env.EMAILJS_TEMPLATE_ID         ?? ""; // auto-reply → client
  const notifyTemplateId = process.env.EMAILJS_NOTIFY_TEMPLATE_ID  ?? ""; // notification → team
  const publicKey        = process.env.EMAILJS_PUBLIC_KEY          ?? "";
  const privateKey       = process.env.EMAILJS_PRIVATE_KEY         ?? "";

  if (!serviceId || !publicKey) {
    console.error("[contact] EmailJS env vars not set.");
    return NextResponse.json(
      { error: "Email service not configured. Please reach us at innocooks@gmail.com directly." },
      { status: 503 }
    );
  }

  // Helper: fire a single EmailJS template call
  async function sendTemplate(tid: string): Promise<Response> {
    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:      serviceId,
        template_id:     tid,
        user_id:         publicKey,
        accessToken:     privateKey,
        template_params: { name, email, business, budget, message },
      }),
    });
  }

  try {
    // Fire both templates in parallel:
    //   templateId       → auto-reply to client   (To: {{email}})
    //   notifyTemplateId → team notification       (To: innocooks@gmail.com, Reply-To: {{email}})
    const promises: Promise<Response>[] = [sendTemplate(templateId)];
    if (notifyTemplateId) {
      promises.push(sendTemplate(notifyTemplateId));
    } else {
      console.warn("[contact] EMAILJS_NOTIFY_TEMPLATE_ID not set - team notification skipped.");
    }

    const results = await Promise.all(promises);

    for (const res of results) {
      if (!res.ok) {
        console.error("[contact] EmailJS returned", res.status, await res.text());
        return NextResponse.json(
          { error: "Could not send your message. Please try again." },
          { status: 502 }
        );
      }
    }
  } catch (err) {
    console.error("[contact] EmailJS fetch failed:", err);
    return NextResponse.json(
      { error: "Network error. Please try again or email innocooks@gmail.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
