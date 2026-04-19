"use client";

import { type CSSProperties, useEffect, useRef } from "react";

type HandyArrowProps = {
  arrow: number;
  arrowWidth?: number;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

export function HandyArrow({
  arrow,
  arrowWidth = 88,
  rotate = 0,
  flipX = false,
  flipY = false,
  className = "",
  style,
  delay = 0,
}: HandyArrowProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  const transform = [
    flipX ? "scaleX(-1)" : "",
    flipY ? "scaleY(-1)" : "",
    rotate ? `rotate(${rotate}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={`annotation-reveal pointer-events-none absolute ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div
        className="annotation-arrow text-gray-900 dark:text-white"
        style={{
          width: arrowWidth,
          height: arrowWidth,
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(/handy-arrows/arrow-${arrow}.svg)`,
          maskImage: `url(/handy-arrows/arrow-${arrow}.svg)`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          transform: transform || undefined,
        }}
      />
    </div>
  );
}
