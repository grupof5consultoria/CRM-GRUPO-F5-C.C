"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  pct: number;
  colorClass?: string;
  colorStyle?: string;
  height?: string;
  delay?: number;
}

export function AnimatedBar({ pct, colorClass, colorStyle, height = "h-1", delay = 0 }: Props) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(Math.min(pct, 100)), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct, delay]);

  return (
    <div
      ref={ref}
      className={`rounded-full transition-all ease-out ${height}`}
      style={{
        width: `${width}%`,
        transitionDuration: "1000ms",
        ...(colorStyle ? { background: colorStyle } : {}),
      }}
    >
      {colorClass && (
        <div className={`w-full h-full rounded-full ${colorClass}`} />
      )}
    </div>
  );
}
