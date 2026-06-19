"use client";

/* Tron-style massive upward light-beam that marks the ribbon origin point.
   The emitter rings shoot a thick white/cyan beam up into the hero section. */

export default function LightTower({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "relative",
        pointerEvents: "none",
        userSelect: "none",
        width: 160,
        height: 120, // Keeps the layout stable so SCROLL text doesn't move
      }}
    >
      {/* Invisible anchor at ring centre — RibbonField reads this for origin coords */}
      <span
        data-ribbon-origin
        style={{
          position: "absolute",
          top: 28, // Restored exact original coordinate so Ribbon math is perfect
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          height: 1,
          display: "block",
        }}
      />

      <svg
        width="240"
        height="800"
        viewBox="0 0 240 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: "visible",
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)"
        }}
      >
        <defs>
          <linearGradient id="lt-beam-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="lt-beam-cyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2bb6ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#2bb6ff" stopOpacity="0" />
            <stop offset="80%" stopColor="#2bb6ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2bb6ff" stopOpacity="0.75" />
          </linearGradient>

          <radialGradient id="lt-disc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#b3e5fc" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#2bb6ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2bb6ff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="lt-fog-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2bb6ff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#2bb6ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2bb6ff" stopOpacity="0" />
          </radialGradient>

          <filter id="blur-massive" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="blur-mid" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="blur-light" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <style>{`
          .lt-beam {
            transform: scaleY(0);
            transform-origin: 120px 0px;
            animation: beamDrop 0.8s cubic-bezier(0.7, 0, 1, 1) forwards;
            animation-delay: 1s;
          }
          @keyframes beamDrop {
            0% { transform: scaleY(0); opacity: 0; }
            10% { transform: scaleY(0); opacity: 1; }
            100% { transform: scaleY(1); opacity: 1; }
          }

          .lt-fireball {
            transform: translateY(0);
            opacity: 0;
            animation: fireballDrop 0.8s cubic-bezier(0.7, 0, 1, 1) forwards;
            animation-delay: 1s;
          }
          @keyframes fireballDrop {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            10% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(708px) scale(1); opacity: 1; }
          }
          
          .lt-stage {
            opacity: 0.25;
            animation: stageIgnite 0.6s cubic-bezier(0.2, 1, 0.3, 1) forwards;
            animation-delay: 1.8s; /* Exactly when the beam hits */
            transform-origin: 120px 708px;
          }
          @keyframes stageIgnite {
            0% { opacity: 0.25; transform: scale(1) translateY(0); }
            10% { opacity: 1; transform: scale(1.02) translateY(2px); }
            40% { opacity: 1; transform: scale(0.98) translateY(-1px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          .lt-flash {
            opacity: 0;
            animation: impactFlash 0.5s ease-out forwards;
            animation-delay: 1.8s;
            transform-origin: 120px 708px;
          }
          @keyframes impactFlash {
            0% { opacity: 0; transform: scale(0.5); }
            10% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0; transform: scale(2); }
          }
        `}</style>

        <g className="lt-beam">
          {/* Ambient cyan glow of the huge beam */}
          <rect x="20" y="0" width="200" height="708" fill="url(#lt-beam-cyan)" filter="url(#blur-massive)" opacity="0.4" />

          {/* Tighter cyan beam */}
          <rect x="60" y="0" width="120" height="708" fill="url(#lt-beam-cyan)" filter="url(#blur-heavy)" opacity="0.6" />

          {/* Inner bright core glow */}
          <rect x="90" y="0" width="60" height="708" fill="url(#lt-beam-core)" filter="url(#blur-mid)" opacity="0.7" />

          {/* Pure sharp white center */}
          <rect x="112" y="0" width="16" height="708" fill="url(#lt-beam-core)" filter="url(#blur-light)" />
          <rect x="116" y="0" width="8" height="708" fill="url(#lt-beam-core)" />
        </g>

        {/* The blinding physical head of the beam that crashes down */}
        <g className="lt-fireball">
          <ellipse cx="120" cy="0" rx="35" ry="12" fill="#ffffff" filter="url(#blur-heavy)" opacity="0.9" />
          <ellipse cx="120" cy="0" rx="16" ry="6" fill="#ffffff" filter="url(#blur-mid)" />
        </g>

        {/* Impact Flash Ring */}
        <ellipse className="lt-flash" cx="120" cy="708" rx="80" ry="25" fill="#ffffff" filter="url(#blur-heavy)" />

        <g className="lt-stage">
          {/* --- Emitter Base --- */}
          {/* Subtle atmospheric fog on the ground */}
          <ellipse cx="120" cy="708" rx="110" ry="35" fill="url(#lt-fog-glow)" filter="url(#blur-massive)" opacity="0.9" />

          {/* Giant base glow */}
          <ellipse cx="120" cy="708" rx="75" ry="24" fill="url(#lt-disc-glow)" filter="url(#blur-heavy)" opacity="0.8" />

          {/* Outer Ring */}
          <ellipse cx="120" cy="708" rx="60" ry="18" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.4" filter="url(#blur-light)" />
          <ellipse cx="120" cy="708" rx="60" ry="18" stroke="#2bb6ff" strokeWidth="10" fill="none" opacity="0.6" filter="url(#blur-mid)" />
          <ellipse cx="120" cy="708" rx="60" ry="18" stroke="#2bb6ff" strokeWidth="2" fill="none" opacity="0.9" />

          {/* Dark inner track (TRON depth effect) */}
          <ellipse cx="120" cy="708" rx="52" ry="15" stroke="#000000" strokeWidth="4" fill="none" opacity="0.5" />

          {/* Origin hotspot */}
          <ellipse cx="120" cy="708" rx="16" ry="5" fill="#ffffff" filter="url(#blur-mid)" />
          <ellipse cx="120" cy="708" rx="8" ry="2.5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
