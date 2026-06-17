"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** ms per character — default 12 (fast) */
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 12,
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    if (prefersReduced.current) {
      setDisplayed(text);
      setDone(true);
      onComplete?.();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    /*
     * Layout-shift fix:
     * Outer span is `relative` and takes the height of the full text via
     * the invisible spacer. The typing text is absolutely overlaid on top.
     * → The heading always occupies its final wrapped height from frame 1,
     *   so nothing below ever shifts while characters appear.
     */
    <span
      className={className}
      style={{ position: "relative", display: "block" }}
    >
      {/* Invisible spacer — holds the full wrapped height at all times */}
      <span aria-hidden="true" style={{ visibility: "hidden", whiteSpace: "pre-wrap" }}>
        {text}
      </span>

      {/* Typing text — absolutely overlaid, same width */}
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {displayed}
        {!done && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "2px",
              height: "1.1em",
              background: "oklch(0.26 0.17 10)",
              marginLeft: "2px",
              verticalAlign: "text-bottom",
              borderRadius: "1px",
              animation: "cursor-blink 600ms step-end infinite",
            }}
          />
        )}
      </span>
    </span>
  );
}
