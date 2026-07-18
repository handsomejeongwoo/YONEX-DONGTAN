"use client";

import { motion, useReducedMotion } from "motion/react";

// 요넥스 스포츠 톤: 빠르게 들어오고 단단하게 멈춘다(ease-out).
const EASE = [0.22, 0.61, 0.18, 1] as const;

export default function HomeHero({ official }: { official: string }) {
  const reduce = useReducedMotion() ?? false;

  // 콘텐츠: 배경이 채워진 뒤(≈0.9s) 순서대로 등장.
  const line = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.5, ease: EASE, delay: reduce ? 0 : delay },
  });

  const dotsTransition = {
    duration: reduce ? 0 : 0.95,
    ease: EASE,
    delay: reduce ? 0 : 0.55,
  };

  return (
    <section className="home-hero">
      {/* 배경: 흰 캔버스 위로 파랑(위)·초록(아래)이 중앙 경계에서 각각 채워짐 (정확히 5:5) */}
      <motion.div
        className="home-hero__blue"
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
      />
      <motion.div
        className="home-hero__green"
        aria-hidden
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
      />

      {/* 점선 2줄 — 좌→우 / 우→좌로 점이 하나씩 찍히듯 드러남(클립 리빌) */}
      <svg
        className="home-hero__dots"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <clipPath id="heroDotsLR" clipPathUnits="userSpaceOnUse">
            <motion.rect
              x="-30"
              y="0"
              width="1260"
              height="600"
              style={{ transformBox: "fill-box", transformOrigin: "left center" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={dotsTransition}
            />
          </clipPath>
          <clipPath id="heroDotsRL" clipPathUnits="userSpaceOnUse">
            <motion.rect
              x="-30"
              y="0"
              width="1260"
              height="600"
              style={{ transformBox: "fill-box", transformOrigin: "right center" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={dotsTransition}
            />
          </clipPath>
        </defs>
        {/* 상단(블루) 점선: 좌 → 우 */}
        <path
          d="M-30 128 H 1230"
          clipPath="url(#heroDotsLR)"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0.1 24"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0.13 }}
        />
        {/* 하단(그린) 점선: 우 → 좌 */}
        <path
          d="M-30 470 H 1230"
          clipPath="url(#heroDotsRL)"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0.1 24"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0.13 }}
        />
      </svg>

      <div className="home-hero__inner">
        <div className="home-hero__copy">
          <motion.div className="home-hero__eyebrow" {...line(0.95)}>
            <span className="home-hero__tick" aria-hidden />
            {official} · 동탄
          </motion.div>
          <h1 className="home-hero__headline">
            <motion.span {...line(1.05)}>라켓, 그냥</motion.span>
            <motion.span {...line(1.15)}>고르지 마세요.</motion.span>
          </h1>
          <motion.p className="home-hero__body" {...line(1.3)}>
            내 스윙과 플레이에 맞는 요넥스 장비를
            <br />
            매장에서 함께 찾아드립니다.
          </motion.p>
          <motion.div className="home-hero__meta" {...line(1.4)}>
            라켓 · 스트링 · 신발 · 대회 장비 상담
          </motion.div>
          <motion.div className="home-hero__cta" {...line(1.5)}>
            <a href="#care" className="btn btn-onblue">
              요넥스 동탄점만의 장점
            </a>
          </motion.div>
        </div>

        {/* 큰 YONEX DONGTAN — 일반 타이포그래피(로고 아님). 블루/그린 경계를 활용해 배치. */}
        <div className="home-hero__type" aria-hidden>
          <b className="solid">YONEX</b>
          <b className="line">DONGTAN</b>
        </div>
      </div>

      {/* 스크롤 힌트 (하단 중앙) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 1.6 }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(14px,2.5vw,26px)",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: ".22em",
          }}
        >
          SCROLL
        </span>
        <motion.span
          animate={reduce ? {} : { y: [0, 7, 0] }}
          transition={
            reduce
              ? {}
              : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }
          style={{ display: "block", lineHeight: 0 }}
        >
          <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
            <path
              d="M9 1 L9 17 M2 11 L9 18 L16 11"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </motion.div>
    </section>
  );
}
