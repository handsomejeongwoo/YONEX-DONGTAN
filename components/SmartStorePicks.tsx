"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 0.61, 0.18, 1] as const;
const STORE_URL = "https://smartstore.naver.com/yonexdontan";

// data/홈페이지-추천상품-4개.md 를 단일 기준으로 사용. 값 임의 변경 금지.
const PICKS = [
  {
    category: "SPEED",
    name: "NANOFLARE 700 GAME",
    description: "빠른 스윙과 셔틀 가속을 원하는 플레이를 위한 헤드라이트 라켓.",
    specs: ["Head Light", "Hi-Flex", "4U · 20–28 lbs"],
    price: "130,000원",
    originalPrice: "145,000원",
    image:
      "https://shop-phinf.pstatic.net/20260327_100/1774588906433LVSOI_PNG/1507570301917235_92086315.png?type=f750_750",
    href: "https://smartstore.naver.com/yonexdontan/products/13313327101",
  },
  {
    category: "POWER",
    name: "ASTROX 77 PRO",
    description:
      "헤드헤비 밸런스와 부드러운 전환감을 바탕으로 파워 플레이를 지향하는 PRO 라켓.",
    specs: ["Head Heavy", "Medium Flex", "4U · 20–28 lbs"],
    price: "260,000원",
    originalPrice: "289,000원",
    image:
      "https://shop-phinf.pstatic.net/20240704_273/1720068652702vUCE2_PNG/18777642726019918_2049650221.png?type=f750_750",
    href: "https://smartstore.naver.com/yonexdontan/products/10537658573",
  },
  {
    category: "CONTROL",
    name: "ARCSABER 11 PRO",
    description: "셔틀 홀딩감과 정확한 컨트롤을 강조한 이븐밸런스 PRO 라켓.",
    specs: ["Even Balance", "Stiff", "3U / 4U"],
    price: "278,000원",
    originalPrice: "309,000원",
    image:
      "https://shop-phinf.pstatic.net/20240703_231/1720004550699jAAzO_PNG/697760969071236_1142989174.png?type=f750_750",
    href: "https://smartstore.naver.com/yonexdontan/products/10534643108",
  },
  {
    category: "ALL-AROUND SHOES",
    name: "POWER CUSHION 65 Z4 VA WIDE",
    description: "여유 있는 와이드 핏과 코트 위 안정감을 함께 고려한 배드민턴화.",
    specs: ["Wide Fit", "POWER CUSHION+", "Indoor Court"],
    price: "179,000원",
    originalPrice: "199,000원",
    image:
      "https://shop-phinf.pstatic.net/20260228_266/17722512867556g64D_PNG/106384137872635431_1454034683.png?type=f750_750",
    href: "https://smartstore.naver.com/yonexdontan/products/13191616539",
  },
];

const WRAP: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 24px",
};

export default function SmartStorePicks() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      style={{
        scrollMarginTop: 80,
        padding: "clamp(64px,9vw,104px) 0",
        background: "var(--paper)",
      }}
    >
      <div style={WRAP}>
        <div
          data-reveal
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--blue)",
          }}
        >
          Smart Store Picks
        </div>
        <h2
          data-reveal
          style={{
            fontSize: "clamp(28px,4.4vw,48px)",
            lineHeight: 1.12,
            letterSpacing: "-0.04em",
            fontWeight: 800,
            margin: "12px 0 0",
          }}
        >
          요넥스 동탄점에서 만나는 장비
        </h2>

        <div
          className="picks-grid"
          style={{ marginTop: "clamp(28px,4vw,44px)" }}
        >
          {PICKS.map((p) => (
            <motion.a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${p.name} · 스마트스토어에서 보기`}
              whileHover="hover"
              variants={{ hover: reduce ? {} : { y: -6 } }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 3,
                overflow: "hidden",
                color: "var(--ink)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  background: "#f4f6f8",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: ".12em",
                    color: "var(--blue)",
                    background: "#fff",
                    border: "1px solid var(--line)",
                    padding: "3px 8px",
                    borderRadius: 2,
                  }}
                >
                  {p.category}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  variants={{ hover: reduce ? {} : { scale: 1.04 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "10%",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "16px 16px 18px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--ink-soft)",
                    margin: 0,
                  }}
                >
                  {p.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  {p.specs.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-soft)",
                        border: "1px solid var(--line)",
                        borderRadius: 2,
                        padding: "3px 7px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginTop: "auto",
                    paddingTop: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9aa7ad",
                      textDecoration: "line-through",
                    }}
                  >
                    {p.originalPrice}
                  </span>
                  <span
                    style={{
                      fontSize: 21,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                    }}
                  >
                    {p.price}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <p
          data-reveal
          style={{
            fontSize: 12.5,
            color: "var(--ink-soft)",
            margin: "18px 0 0",
          }}
        >
          가격 및 재고는 스마트스토어 기준입니다.
        </p>

        <div data-reveal style={{ marginTop: "clamp(22px,3vw,30px)" }}>
          <a
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            스마트스토어에서 전체 보기 ↗
          </a>
        </div>
      </div>
    </section>
  );
}
