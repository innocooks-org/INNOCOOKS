"use client";

import type { ReactNode } from "react";

export default function RibbonKeyword({
  children,
  serif = false,
  className,
}: {
  children: ReactNode;
  serif?: boolean;
  className?: string;
}) {
  return (
    <span
      data-ribbon-kw
      className={className}
      style={{
        color: "#c45b35",
        ...(serif
          ? {
              fontFamily: "var(--font-instrument), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              textTransform: "none",
            }
          : null),
      }}
    >
      {children}
    </span>
  );
}
