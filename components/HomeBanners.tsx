"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Banner } from "@/lib/types";

const EASE = [0.22, 0.61, 0.18, 1] as const;
const INTERVAL = 6000;

/**
 * 홈 배너 캐러셀.
 *
 * 문구·버튼이 그려진 완성 이미지를 화면 폭 전체로 띄운다.
 * 첫 이미지를 숨긴 채로 흘려 높이를 잡고, 실제 슬라이드는 그 위에
 * 절대배치해서 전환 중에도 레이아웃이 흔들리지 않게 한다.
 */
export default function HomeBanners({ banners }: { banners: Banner[] }) {
  const reduce = useReducedMotion() ?? false;
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const items = banners.filter((b) => b.image);
  const count = items.length;

  const go = useCallback(
    (d: number) => setState(([i]) => [(i + d + count) % count, d]),
    [count],
  );
  const jump = useCallback(
    (to: number) => setState(([i]) => [to, to > i ? 1 : -1]),
    [],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    timer.current = window.setInterval(() => go(1), INTERVAL);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [count, paused, go]);

  if (count === 0) return null;

  const b = items[Math.min(index, count - 1)];

  const slide = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={b.image}
      alt={b.title || ""}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );

  return (
    <section
      className="home-banner"
      aria-label="배너"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-banner__stage">
        {/* 높이 기준자 — 보이지 않지만 자리를 차지해 컨테이너 높이를 만든다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={items[0].image}
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "auto", display: "block", visibility: "hidden" }}
        />

        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={b.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? "8%" : "-8%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? "-8%" : "8%" }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ position: "absolute", inset: 0 }}
          >
            {b.href ? (
              <a
                href={b.href}
                aria-label={b.title || "배너 열기"}
                {...(/^https?:/.test(b.href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                {slide}
              </a>
            ) : (
              slide
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              className="home-banner__nav home-banner__nav--prev"
              aria-label="이전 배너"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="home-banner__nav home-banner__nav--next"
              aria-label="다음 배너"
              onClick={() => go(1)}
            >
              ›
            </button>

            <div className="home-banner__dots">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`${i + 1}번째 배너 보기`}
                  aria-current={i === index}
                  onClick={() => jump(i)}
                  className={
                    i === index
                      ? "home-banner__dot home-banner__dot--on"
                      : "home-banner__dot"
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
