"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

export default function HomeHero() {
  const reduce = useReducedMotion() ?? false;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
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
    ["#ffffff", "#ffffff", "#063d7a"],
  );
  const wordScale = useTransform(scrollYProgress, [0, 0.42, 0.56], [1, 1.035, 1.16]);
  const wordY = useTransform(scrollYProgress, [0.35, 0.58], ["0vh", "-10vh"]);
  const wordOpacity = useTransform(scrollYProgress, [0.42, 0.6], [1, 0]);

  // 실제 매장 로고가 나타나 확대한 뒤, 다음 콘텐츠로 자연스럽게 넘어간다.
  const logoOpacity = useTransform(scrollYProgress, [0.56, 0.68, 0.96, 1], [0, 1, 1, 0]);
  const logoScale = useTransform(scrollYProgress, [0.56, 0.74, 1], [0.84, 1, 1.55]);
  const logoY = useTransform(scrollYProgress, [0.74, 1], ["0vh", "-2vh"]);
  const introOpacity = useTransform(scrollYProgress, [0.975, 1], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.09], [1, 0]);

  // 새로고침 전까지는 한 번만 실행한다. 끝까지 진입한 뒤 위로 돌아와도 인트로를 다시 만들지 않는다.
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!reduce && latest >= 0.985) setHasEntered(true);
  });

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

    timer = window.setTimeout(() => {
      typeWord("YONEX", setTypedYonex, () => {
        setTypingStage("dongtan");
        timer = window.setTimeout(() => {
          typeWord("DONGTAN", setTypedDongtan, () => setTypingStage("complete"));
        }, 150);
      });
    }, 360);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduce]);

  if (hasEntered) return null;

  return (
    <div ref={sceneRef} className="home-intro-scroll">
      <motion.section
        className="home-intro"
        aria-label="요넥스 동탄점 인트로"
        style={reduce ? undefined : { opacity: introOpacity }}
      >
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
              : { color: wordColor, scale: wordScale, y: wordY, opacity: wordOpacity }
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

        <motion.div
          className="home-intro__logo"
          aria-hidden
          style={reduce ? { opacity: 1, scale: 1 } : { opacity: logoOpacity, scale: logoScale, y: logoY }}
        >
          {/* 공유 미리보기와 동일한 OG 이미지. 새 심볼을 그려 넣지 않는다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/og-image.png" alt="" />
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
      </motion.section>
    </div>
  );
}
