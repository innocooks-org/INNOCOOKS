"use client";
import { useEffect, useRef } from "react";

const FROM = "one.";
const TO = "where.";
const BLUE = "#2bb6ff";
const BLUE_SHADOW = "0 0 22px rgba(43,182,255,.55)";

export default function SignalCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const kineticRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const el = suffixRef.current;
    if (!card || !el) return;

    let cancelled = false;

    const CURSOR = '<span class="animate-pulse" style="margin-left: 1px; font-weight: 300; opacity: 0.8;">|</span>';
    
    // Add Extended Ease for color and shadow transitions
    el.style.whiteSpace = "nowrap";
    el.style.transition = "color 0.4s cubic-bezier(0.22, 1, 0.36, 1), text-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1)";

    // Read the ribbon's actual --pb CSS variable so the animation fires when
    // the blue line physically reaches this card, not just when it's in viewport.
    const ribbonField = card.closest<HTMLElement>(".ribbon-field");
    const svgEl = ribbonField?.querySelector("svg");

    // Calculate the pb thresholds at which the blue ribbon enters the card and hits the text
    const computeThresholds = () => {
      if (!ribbonField) return { enter: 0.6, hit: 0.65 };
      const fieldH = ribbonField.scrollHeight;
      if (!fieldH) return { enter: 0.6, hit: 0.65 };
      const ribbonTop = ribbonField.getBoundingClientRect().top + window.scrollY;
      const cardTop = card.getBoundingClientRect().top + window.scrollY;
      
      // Begin the backspace sequence when the ribbon is near the top of the card
      const cardEnterInField = cardTop - ribbonTop + card.offsetHeight * 0.2;
      // Guarantee a minimum of 400px of scrolling for the typing to feel mechanical and readable,
      // regardless of how physically small the card is on mobile screens.
      const cardCrossInField = cardEnterInField + Math.max(card.offsetHeight * 0.8, 400);
      
      const rawEnter = Math.min(0.92, Math.max(0, cardEnterInField / fieldH));
      const rawHit = Math.min(0.92, Math.max(0, cardCrossInField / fieldH));
      
      return {
        enter: Math.max(0, (rawEnter - 0.03) / 0.92),
        hit: Math.max(0, (rawHit - 0.03) / 0.92)
      };
    };

    let thresholds = computeThresholds();
    let lastStep = -1;
    let lastShowCursor: boolean | null = null;
    let isBlue = false;

    function check() {
      if (cancelled || !svgEl) return;
      const pb = parseFloat(svgEl.style.getPropertyValue("--pb") || "0");
      
      let progress = 0;
      if (thresholds.hit > thresholds.enter) {
         progress = (pb - thresholds.enter) / (thresholds.hit - thresholds.enter);
         progress = Math.max(0, Math.min(1, progress));
      }

      const totalSteps = FROM.length + TO.length;
      const step = Math.min(totalSteps, Math.floor(progress * (totalSteps + 1)));
      const showCursor = progress > 0 && progress < 1;

      if (step !== lastStep || showCursor !== lastShowCursor) {
        lastStep = step;
        lastShowCursor = showCursor;
        
        let currentStr = "";
        if (step <= FROM.length) {
           currentStr = FROM.slice(0, FROM.length - step);
           if (isBlue) {
             isBlue = false;
             el.style.color = "";
             el.style.textShadow = "none";
           }
        } else {
           currentStr = TO.slice(0, step - FROM.length);
           if (!isBlue) {
             isBlue = true;
             el.style.color = BLUE;
             el.style.textShadow = BLUE_SHADOW;
           }
        }
        
        if (showCursor) {
           el.innerHTML = currentStr + CURSOR;
        } else {
           el.textContent = currentStr;
        }
      }
    }

    const onResize = () => { thresholds = computeThresholds(); check(); };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.fonts?.ready?.then(() => { thresholds = computeThresholds(); check(); });
    // Recompute once after layout settles (fonts, images shift layout)
    const t = window.setTimeout(() => { thresholds = computeThresholds(); check(); }, 600);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex h-full flex-col justify-center border border-iron p-8"
      style={{ backgroundColor: "rgba(18,17,18,0.92)" }}
    >
      <span className="label-mono">// SIGNAL</span>
      <p className="display h-md mt-4 text-white">
        One conversation{" "}
        <span ref={kineticRef} className="text-kinetic">
          reaches every<span ref={suffixRef}>one.</span>
        </span>
      </p>
    </div>
  );
}
