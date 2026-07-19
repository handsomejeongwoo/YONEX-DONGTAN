"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// 초대형 가로 타이포 트랙 — 화면보다 훨씬 넓게 반복해 좌우가 잘리고, 스크롤에 맞춰 가로로 흐른다.
const TRACK_REPEAT_COUNT = 6;

export default function HomeHero() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState({ start: 0, end: 1 });
  const { scrollY } = useScroll();

  // sticky 영역을 지나간 뒤에도 진행값이 되감기지 않도록 문서 스크롤 기준으로 계산한다.
  useEffect(() => {
    const measureRange = () => {
      const node = ref.current;
      if (!node) return;

      const start = node.getBoundingClientRect().top + window.scrollY;
      const end = Math.max(start + 1, start + node.offsetHeight - window.innerHeight);
      setScrollRange({ start, end });
    };

    measureRange();
    window.addEventListener("resize", measureRange);
    return () => window.removeEventListener("resize", measureRange);
  }, []);

  const p = useTransform(scrollY, [scrollRange.start, scrollRange.end], [0, 1], {
    clamp: true,
  });

  // 흰 배경 + 검정 심볼 장면을 충분히 유지하고, 전환도 한 호흡 길게 둔다.
  const blueClip = useTransform(
    p,
    [0.25, 0.58],
    ["circle(0vmax at 50% 50%)", "circle(165vmax at 50% 50%)"],
  );
  // 파란 장면이 완성된 뒤 초록 장면으로 넘어간다.
  const greenClip = useTransform(
    p,
    [0.61, 0.71],
    ["circle(0vmax at 50% 50%)", "circle(165vmax at 50% 50%)"],
  );
  // 타이포가 나올 때에는 심볼이 완전히 사라져 있다.
  const symScale = useTransform(p, [0.16, 0.24], [1, 1.025]);
  const symOpacity = useTransform(p, [0.16, 0.24], [1, 0]);
  const hintOpacity = useTransform(p, [0, 0.16], [1, 0]);
  // 인트로 후반 약 30%를 타이포에 배정해, 가로 흐름을 충분히 오래 보여준다.
  const typeOpacity = useTransform(p, [0.7, 0.77], [0, 1]);
  const mobileTypeY = useTransform(p, [0.7, 0.78], ["10vh", "0vh"]);
  const track1X = useTransform(p, [0.7, 1], ["14vw", "-110vw"]);
  const track2X = useTransform(p, [0.7, 1], ["-42vw", "-166vw"]);

  if (reduce) {
    return (
      <div className="home-intro-scroll">
        <section className="home-intro--static">
          <span className="home-intro__symbol">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/yonex-symbol-black-transparent.png" alt="요넥스 동탄점" />
          </span>
        </section>
      </div>
    );
  }

  return (
    <div ref={ref} className="home-intro-scroll">
      <section className="home-intro">
        {/* 파란 원 → 초록 원 (흰 아이보리 위로 확장) */}
        <motion.div
          className="home-intro__circle home-intro__circle--blue"
          aria-hidden
          style={{ clipPath: blueClip }}
        />
        <motion.div
          className="home-intro__circle home-intro__circle--green"
          aria-hidden
          style={{ clipPath: greenClip }}
        />

        {/* 초대형 가로 타이포 (초록 장면) */}
        <motion.div className="home-intro__type" aria-hidden style={{ opacity: typeOpacity }}>
          <motion.div className="home-intro__track" style={{ x: track1X }}>
            {Array.from({ length: TRACK_REPEAT_COUNT }, (_, index) => (
              <span className="home-intro__track-pair" key={`top-${index}`}>
                <span className="home-intro__yonex">YONEX</span>
                <span className="home-intro__dongtan">DONGTAN</span>
                <span className="home-intro__separator">·</span>
              </span>
            ))}
          </motion.div>
          <motion.div className="home-intro__track" style={{ x: track2X }}>
            {Array.from({ length: TRACK_REPEAT_COUNT }, (_, index) => (
              <span className="home-intro__track-pair" key={`bottom-${index}`}>
                <span className="home-intro__yonex">YONEX</span>
                <span className="home-intro__dongtan">DONGTAN</span>
                <span className="home-intro__separator">·</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* 모바일은 가로 트랙 대신 중앙 타이포가 올라와 고정된다. */}
        <motion.div
          className="home-intro__mobile-type"
          aria-hidden
          style={{ opacity: typeOpacity, y: mobileTypeY }}
        >
          <span className="home-intro__yonex">YONEX</span>
          <span className="home-intro__dongtan">DONGTAN</span>
        </motion.div>

        {/* 제공된 검정 요넥스 심볼 — 타이포 장면 전 완전히 퇴장 */}
        <motion.span
          className="home-intro__symbol"
          style={{ scale: symScale, opacity: symOpacity }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/yonex-symbol-black-transparent.png" alt="" aria-hidden />
        </motion.span>

        <motion.div className="home-intro__hint" aria-hidden style={{ opacity: hintOpacity }}>
          <span>SCROLL TO ENTER</span>
          <motion.svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M9 1V19M2 12L9 19L16 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      </section>
    </div>
  );
}
