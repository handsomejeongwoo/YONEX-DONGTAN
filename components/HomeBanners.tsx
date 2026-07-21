"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Banner } from "@/lib/types";

const EASE = [0.22, 0.61, 0.18, 1] as const;
const INTERVAL = 6000;

const THEME: Record<
  Banner["theme"],
  { bg: string; ink: string; sub: string; btnBg: string; btnInk: string; label: string }
> = {
  blue: {
    bg: "linear-gradient(135deg,#0b50a1,#083d7a)",
    ink: "#ffffff",
    sub: "rgba(255,255,255,.82)",
    btnBg: "#ffffff",
    btnInk: "#0b50a1",
    label: "rgba(255,255,255,.72)",
  },
  green: {
    bg: "linear-gradient(135deg,#1f9d55,#15794080)",
    ink: "#ffffff",
    sub: "rgba(255,255,255,.86)",
    btnBg: "#ffffff",
    btnInk: "#157940",
    label: "rgba(255,255,255,.75)",
  },
  white: {
    bg: "#ffffff",
    ink: "#10222c",
    sub: "#5b6d73",
    btnBg: "#0b50a1",
    btnInk: "#ffffff",
    label: "#0b50a1",
  },
};

export default function HomeBanners({ banners }: { banners: Banner[] }) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const count = banners.length;

  useEffect(() => {
    if (count <= 1 || paused || reduce) return;
    timer.current = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      INTERVAL,
    );
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [count, paused, reduce]);

  if (count === 0) return null;

  const b = banners[Math.min(index, count - 1)];
  const t = THEME[b.theme] ?? THEME.blue;
  const imageFirst = b.imagePosition === "left";

  return (
    <section
      aria-label="공지 배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        background: t.bg,
        borderBottom: b.theme === "white" ? "1px solid var(--line)" : "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(28px,4vw,44px) 24px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={b.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="home-banner"
            data-image-first={imageFirst ? "true" : undefined}
          >
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              {b.category && (
                <div
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: t.label,
                  }}
                >
                  {b.category}
                </div>
              )}
              <h2
                style={{
                  fontSize: "clamp(22px,3.2vw,36px)",
                  lineHeight: 1.18,
                  letterSpacing: "-0.03em",
                  fontWeight: 800,
                  color: t.ink,
                  margin: b.category ? "10px 0 0" : 0,
                }}
              >
                {b.title}
              </h2>
              {b.description && (
                <p
                  style={{
                    fontSize: "clamp(14px,1.6vw,16px)",
                    lineHeight: 1.6,
                    color: t.sub,
                    margin: "10px 0 0",
                    maxWidth: "52ch",
                  }}
                >
                  {b.description}
                </p>
              )}
              {b.href && b.buttonLabel && (
                <a
                  href={b.href}
                  {...(/^https?:/.test(b.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 44,
                    padding: "0 22px",
                    marginTop: 20,
                    background: t.btnBg,
                    color: t.btnInk,
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {b.buttonLabel}
                </a>
              )}
            </div>

            {b.image && (
              <div
                className="home-banner__media"
                style={{
                  flex: "0 1 420px",
                  aspectRatio: "16 / 9",
                  borderRadius: 3,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.12)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {banners.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${i + 1}번째 배너 보기`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 26 : 9,
                  height: 9,
                  padding: 0,
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background:
                    b.theme === "white"
                      ? i === index
                        ? "#0b50a1"
                        : "#cdd7dc"
                      : i === index
                        ? "#fff"
                        : "rgba(255,255,255,.45)",
                  transition: "width .25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
