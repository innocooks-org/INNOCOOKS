/* ════════════════════════════════════════════════════════════════════════
   CONTACT - the single integration seam for the "Get in touch" form.

   The site is a static export (`output: "export"`), so there is no server
   runtime here to receive a POST. Instead the form talks to ONE external
   endpoint that you configure at build time. Point it at:

     • your own backend  (e.g. https://api.innocooks.com/contact)
     • a serverless function (Vercel / Netlify / Cloudflare Workers)
     • a form/email service: Formspree, Web3Forms, Getform, Basin, Formcarry…

   Configure it in `.env.local` (see `.env.example`):

     NEXT_PUBLIC_CONTACT_ENDPOINT=https://…        # the POST URL
     NEXT_PUBLIC_CONTACT_ACCESS_KEY=…              # optional (e.g. Web3Forms)

   If NEXT_PUBLIC_CONTACT_ENDPOINT is empty, the form gracefully falls back to
   the original behaviour - composing a structured `mailto:` - so the site
   works with zero backend out of the box and never loses a lead.

   SECURITY NOTE: anything in NEXT_PUBLIC_* is shipped to the browser. Only put
   PUBLIC keys here (the access keys these form services hand out are designed
   to be public + are rate-limited/domain-locked on their side). Never place a
   private SMTP password, Resend/SendGrid secret, or DB credential in a
   NEXT_PUBLIC_ var - those belong behind your own endpoint.
   ════════════════════════════════════════════════════════════════════════ */

export const CONTACT_EMAIL = "innocooks@gmail.com";

/** Trimmed so a stray space in the env var can't break the request. */
export const CONTACT_ENDPOINT = (
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? ""
).trim();

const CONTACT_ACCESS_KEY = (
  process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY ?? ""
).trim();

/** True when a real endpoint is wired up; drives the form's copy + behaviour. */
export const hasContactEndpoint = CONTACT_ENDPOINT.length > 0;

export type ContactPayload = {
  name: string;
  email: string;
  business: string;
  message: string;
};

export type ContactResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side validation. The endpoint MUST still validate server-side - this
 *  is only for fast, friendly feedback, never a security control. */
export function validateContact(p: ContactPayload): string | null {
  if (!p.name.trim()) return "Please add your name.";
  if (!p.email.trim() || !EMAIL_RE.test(p.email.trim()))
    return "Please add a valid email so we can reply.";
  if (p.message.trim().length < 10)
    return "Tell us a little more. What do you need?";
  return null;
}

/** Build the structured mailto used as the no-endpoint fallback. Every value is
 *  encodeURIComponent-ed, which neutralises header/body injection into the URL. */
export function contactMailto(p: ContactPayload): string {
  const subject = encodeURIComponent(
    `Project enquiry: ${p.business || p.name || "InnoCooks"}`
  );
  const body = encodeURIComponent(
    [
      `Name: ${p.name}`,
      `Email: ${p.email}`,
      `Business: ${p.business}`,
      "",
      p.message,
    ].join("\n")
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/** POST the enquiry to the configured endpoint as JSON.
 *  Works as-is with Formspree, Web3Forms, Getform, Basin and most custom APIs.
 *  Returns a typed result; the caller decides how to surface it.
 *
 *  `signal` lets the caller apply a timeout / abort on unmount. */
export async function sendContact(
  p: ContactPayload,
  signal?: AbortSignal
): Promise<ContactResult> {
  if (!hasContactEndpoint) {
    return { ok: false, error: "No contact endpoint configured." };
  }

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // services like Formspree return JSON (not a redirect) when asked
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...p,
        // included only when set - Web3Forms requires `access_key`
        ...(CONTACT_ACCESS_KEY ? { access_key: CONTACT_ACCESS_KEY } : {}),
        // helpful context for whoever receives it
        source: "innocooks.com/contact",
        submitted_at: new Date().toISOString(),
      }),
      signal,
    });

    if (res.ok) return { ok: true };

    // surface a service-provided message when there is one
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.message || data?.error || "";
    } catch {
      /* non-JSON error body - ignore */
    }
    return {
      ok: false,
      error: detail || `Request failed (${res.status}). Please try again.`,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "The request timed out. Please try again." };
    }
    return {
      ok: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
