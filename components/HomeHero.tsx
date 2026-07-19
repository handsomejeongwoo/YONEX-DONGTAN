"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// 요넥스 스포츠 톤: 빠르게 들어오고 단단하게 멈춘다(ease-out).
const EASE = [0.22, 0.61, 0.18, 1] as const;

export default function HomeHero({ official }: { official: string }) {
  const reduce = useReducedMotion() ?? false;
  const sceneRef = useRef<HTMLElement>(null);
  const [typedYonex, setTypedYonex] = useState(reduce ? "YONEX" : "");
  const [typedDongtan, setTypedDongtan] = useState(reduce ? "DONGTAN" : "");
  const [typingStage, setTypingStage] = useState<"yonex" | "dongtan" | "complete">(
    reduce ? "complete" : "yonex",
  );
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // 첫 스크롤 구간에서 두 단어가 코트 밖으로 밀려나는 느낌을 만든다.
  // vw 단위를 사용해 모바일에서도 화면 폭에 맞춰 이동 거리가 자연스럽게 줄어든다.
  const yonexX = useTransform(scrollYProgress, [0, 0.72, 1], ["0vw", "-14vw", "-54vw"]);
  const yonexY = useTransform(scrollYProgress, [0, 1], ["0vh", "-11vh"]);
  const dongtanX = useTransform(scrollYProgress, [0, 0.72, 1], ["0vw", "14vw", "54vw"]);
  const dongtanY = useTransform(scrollYProgress, [0, 1], ["0vh", "11vh"]);
  const dotsX = useTransform(scrollYProgress, [0, 1], ["0vw", "-4vw"]);

  useEffect(() => {
    if (reduce) {
      setTypedYonex("YONEX");
      setTypedDongtan("DONGTAN");
      setTypingStage("complete");
      return;
    }

    let timer: number | undefined;
    let cancelled = false;

    const typeWord = (
      word: string,
      setWord: (value: string) => void,
      done: () => void,
    ) => {
      let index = 0;
      const next = () => {
        if (cancelled) return;
        index += 1;
        setWord(word.slice(0, index));
        if (index < word.length) {
          timer = window.setTimeout(next, 120);
        } else {
          done();
        }
      };
      next();
    };

    timer = window.setTimeout(() => {
      typeWord("YONEX", setTypedYonex, () => {
        setTypingStage("dongtan");
        timer = window.setTimeout(() => {
          typeWord("DONGTAN", setTypedDongtan, () => setTypingStage("complete"));
        }, 180);
      });
    }, 900);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduce]);

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
    <section ref={sceneRef} className="home-hero-scroll">
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
        <motion.svg
        className="home-hero__dots"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        aria-hidden
        style={reduce ? undefined : { x: dotsX }}
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
          className="home-hero__dots-green"
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
        </motion.svg>

        <div className="home-hero__inner">
        <motion.div className="home-hero__dealer" {...line(0.95)}>
          <span className="home-hero__tick" aria-hidden />
          {official} · 동탄
        </motion.div>

        {/* 큰 YONEX DONGTAN — 일반 타이포그래피(로고 아님). */}
        <motion.div
          className="home-hero__type"
          aria-hidden
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: EASE, delay: reduce ? 0 : 0.72 }}
        >
          <motion.b
            className="solid"
            style={reduce ? undefined : { x: yonexX, y: yonexY }}
          >
            {typedYonex}
            {typingStage === "yonex" ? <span className="home-hero__cursor" /> : null}
          </motion.b>
          <motion.b
            className="line"
            style={reduce ? undefined : { x: dongtanX, y: dongtanY }}
          >
            {typedDongtan}
            {typingStage === "dongtan" ? <span className="home-hero__cursor" /> : null}
          </motion.b>
        </motion.div>
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
    </section>
  );
}
