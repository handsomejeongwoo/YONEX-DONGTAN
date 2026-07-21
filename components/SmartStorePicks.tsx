"use client";

import { motion, useReducedMotion } from "motion/react";
import type { FeaturedProduct } from "@/lib/types";
import { finalPrice, formatWon, toPercent, toWon } from "@/lib/admin/collections";

const EASE = [0.22, 0.61, 0.18, 1] as const;
const STORE_URL = "https://smartstore.naver.com/yonexdontan";

// 카드 표시용 형태(관리 데이터 FeaturedProduct 를 매핑).
type Pick = {
  category: string;
  name: string;
  description: string;
  specs: string[];
  /** 화면에 크게 보여줄 최종가 */
  price: string;
  /** 할인 있을 때만 채워지는 취소선 정가 */
  originalPrice: string | null;
  discountPercent: number;
  image: string;
  href: string;
};

function toPick(p: FeaturedProduct): Pick {
  const listPrice = toWon(p.price);
  const discount = toPercent(p.discountPercent);
  const final = finalPrice(listPrice, discount);
  return {
    category: p.category,
    name: p.name,
    description: p.blurb,
    specs: p.specs ?? [],
    price: final ? formatWon(final) : "",
    originalPrice: discount > 0 && listPrice ? formatWon(listPrice) : null,
    discountPercent: discount,
    image: p.image,
    href: p.url,
  };
}

const WRAP: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 24px",
};

export default function SmartStorePicks({
  products,
}: {
  products: FeaturedProduct[];
}) {
  const reduce = useReducedMotion() ?? false;
  const PICKS = products.map(toPick);
  if (PICKS.length === 0) return null;

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
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: 8,
                    marginTop: "auto",
                    paddingTop: 8,
                  }}
                >
                  {p.originalPrice && (
                    <span
                      style={{
                        fontSize: 13,
                        color: "#9aa7ad",
                        textDecoration: "line-through",
                      }}
                    >
                      {p.originalPrice}
                    </span>
                  )}
                  {p.discountPercent > 0 && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#c0392b",
                      }}
                    >
                      {p.discountPercent}%
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 21,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                      width: "100%",
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
            네이버 스마트 스토어 바로가기
          </a>
        </div>
      </div>
    </section>
  );
}
