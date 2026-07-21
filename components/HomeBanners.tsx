"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Banner } from "@/lib/types";

const EASE = [0.22, 0.61, 0.18, 1] as const;
const INTERVAL = 6000;

/**
 * 홈 배너 캐러셀.
 * 문구·버튼이 그려진 완성 이미지를 그대로 띄운다(웹에서 텍스트를 얹지 않음).
 */
export default function HomeBanners({ banners }: { banners: Banner[] }) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const items = banners.filter((b) => b.image);
  const count = items.length;

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

  const b = items[Math.min(index, count - 1)];

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={b.image}
      alt={b.title || ""}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );

  return (
    <section
      aria-label="배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ background: "var(--paper)", position: "relative" }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={b.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {b.href ? (
              <a
                href={b.href}
                aria-label={b.title || "배너 열기"}
                {...(/^https?:/.test(b.href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{ display: "block" }}
              >
                {image}
              </a>
            ) : (
              image
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 12,
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${i + 1}번째 배너 보기`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 24 : 9,
                  height: 9,
                  padding: 0,
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background:
                    i === index ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.5)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,.12)",
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
