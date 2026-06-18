'use client';

/**
 * Optional convenience wrapper. Identical to writing
 *   <span data-ribbon-kw style={{ color: '#c45b35' }}>word</span>
 * but keeps the intent readable in JSX. Use on ANY word you want the ribbons to
 * connect and the blue ribbon to convert. Renders inline; inherits font.
 */

import type { ReactNode } from 'react';

export default function RibbonKeyword({
  children,
  serif = false,
  className,
}: {
  children: ReactNode;
  serif?: boolean; // set true to use the Instrument Serif italic accent treatment
  className?: string;
}) {
  return (
    <span
      data-ribbon-kw
      className={className}
      style={{
        color: '#c45b35', // starting (orange) state — JS flips to blue on scroll
        ...(serif
          ? { fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, textTransform: 'none' }
          : null),
      }}
    >
      {children}
    </span>
  );
}
