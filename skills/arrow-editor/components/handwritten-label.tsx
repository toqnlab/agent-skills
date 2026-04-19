"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

export type HandwrittenFont = "gloria" | "caveat" | "homemade" | "rocksalt";
export type HandwrittenSize = "sm" | "md" | "lg";

type HandwrittenLabelProps = {
  children: ReactNode;
  rotate?: number;
  font?: HandwrittenFont;
  size?: HandwrittenSize;
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

export const FONT_CLASS: Record<HandwrittenFont, string> = {
  gloria: "font-handwritten",
  caveat: "font-caveat",
  homemade: "font-homemade",
  rocksalt: "font-rocksalt",
};

export const SIZE_CLASS: Record<HandwrittenSize, string> = {
  sm: "text-base md:text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
};

export function HandwrittenLabel({
  children,
  rotate = 0,
  font = "gloria",
  size = "md",
  className = "",
  style,
  delay = 0,
}: HandwrittenLabelProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => el.classList.add("visible"), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const transform = rotate ? `rotate(${rotate}deg)` : undefined;

  return (
    <span
      ref={ref}
      className={`annotation-reveal pointer-events-none absolute ${FONT_CLASS[font]} ${SIZE_CLASS[size]} leading-none text-gray-900 dark:text-white ${className}`}
      style={{ ...style, transform }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
