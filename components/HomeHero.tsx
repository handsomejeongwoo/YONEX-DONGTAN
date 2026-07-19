"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export default function HomeHero() {
  const reduce = useReducedMotion() ?? false;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [typedYonex, setTypedYonex] = useState(reduce ? "YONEX" : "");
  const [typedDongtan, setTypedDongtan] = useState(reduce ? "DONGTAN" : "");
  const [typingStage, setTypingStage] = useState<"yonex" | "dongtan" | "complete">(
    reduce ? "complete" : "yonex",
  );
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // 두 색을 보간하지 않고, 초록 레이어가 파랑을 덮어 장면이 바뀌는 느낌을 만든다.
  const greenScale = useTransform(scrollYProgress, [0.22, 0.55], [0, 1]);
  const wordColor = useTransform(
    scrollYProgress,
    [0, 0.35, 0.5],
    ["#ffffff", "#ffffff", "#e7ffb3"],
  );
  // 마지막 초록 장면에서도 타이포를 남긴다. 장면이 투명해지지 않고 그대로 다음 본문 위로 지나간다.
  const wordScale = useTransform(scrollYProgress, [0, 0.42, 1], [1, 1.035, 1.08]);
  const wordY = useTransform(scrollYProgress, [0.35, 0.56, 1], ["0vh", "0vh", "-7vh"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.09], [1, 0]);

  useEffect(() => {
    if (reduce) {
      setTypedYonex("YONEX");
      setTypedDongtan("DONGTAN");
      setTypingStage("complete");
      return;
    }

    let timer: number | undefined;
    let cancelled = false;
    const typeWord = (word: string, setWord: (value: string) => void, done: () => void) => {
      let index = 0;
      const next = () => {
        if (cancelled) return;
        index += 1;
        setWord(word.slice(0, index));
        if (index < word.length) timer = window.setTimeout(next, 105);
        else done();
      };
      next();
    };

    // 처음에는 커서만 2~3회 깜빡여, 타이핑이 시작되는 순간을 또렷하게 만든다.
    timer = window.setTimeout(() => {
      typeWord("YONEX", setTypedYonex, () => {
        setTypingStage("dongtan");
        timer = window.setTimeout(() => {
          typeWord("DONGTAN", setTypedDongtan, () => setTypingStage("complete"));
        }, 150);
      });
    }, 1750);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduce]);

  return (
    <div ref={sceneRef} className="home-intro-scroll">
      <section className="home-intro" aria-label="요넥스 동탄점 인트로">
        <div className="home-intro__blue" aria-hidden />
        <motion.div
          className="home-intro__green"
          aria-hidden
          style={reduce ? { scaleY: 1 } : { scaleY: greenScale }}
        />

        <motion.div
          className="home-intro__word"
          aria-hidden
          style={
            reduce
              ? { color: "#fff" }
              : { color: wordColor, scale: wordScale, y: wordY }
          }
        >
          <span>
            {typedYonex}
            {typingStage === "yonex" ? <i className="home-intro__cursor" /> : null}
          </span>
          <span>
            {typedDongtan}
            {typingStage === "dongtan" ? <i className="home-intro__cursor" /> : null}
          </span>
        </motion.div>

        {!reduce && (
          <motion.div className="home-intro__hint" aria-hidden style={{ opacity: hintOpacity }}>
            <span>SCROLL TO ENTER</span>
            <motion.svg
              width="18"
              height="20"
              viewBox="0 0 18 20"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                d="M9 1 L9 17 M2 11 L9 18 L16 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        )}
      </section>
    </div>
  );
}
