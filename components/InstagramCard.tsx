"use client";

import { useState } from "react";
import type { InstagramItem } from "@/lib/types";

// 릴스는 인스타 릴스처럼 세로(9:16) 컨테이너로, 사진 게시물은 1:1로 표시합니다.
// 이미지는 무단 실시간 스크래핑이 아니라 로컬에 저장한 커버만 사용합니다.
// 기본 상태는 이미지 위주로 깔끔하게, 호버 시 "게시물 보기" UI가 떠오릅니다.
export default function InstagramCard({ item }: { item: InstagramItem }) {
  const [broken, setBroken] = useState(false);
  const isReel = item.type === "reel";
  const hasImg = !!item.image && !broken;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${isReel ? "릴스" : "게시물"}: ${item.caption}`}
      className="ig-tile"
      style={{
        aspectRatio: isReel ? "9 / 16" : "1 / 1",
        color: "#fff",
      }}
    >
      {hasImg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ig-cover"
            src={item.image}
            alt={item.caption}
            loading="lazy"
            onError={() => setBroken(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* 기본 상태에서도 상/하단 아이콘 가독성을 위한 아주 옅은 그라디언트 */}
          <span
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 62%,rgba(7,31,58,.55) 100%)",
            }}
          />
        </>
      ) : (
        // 커버가 없을 때만 세련된 딥블루 폴백
        <span
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg,#0b50a1 0%,#083d7a 55%,#072f5e 100%)",
          }}
        />
      )}

      {/* 좌상단: 릴스/사진 글리프 (항상 표시) */}
      <span
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: ".14em",
          color: "#fff",
          textShadow: "0 1px 3px rgba(0,0,0,.5)",
        }}
      >
        {isReel ? <ReelGlyph /> : <PhotoGlyph />}
        {isReel ? "REEL" : "PHOTO"}
      </span>

      {/* 우상단: 날짜 (데이터 라벨) */}
      <span
        style={{
          position: "absolute",
          top: 11,
          right: 11,
          zIndex: 2,
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 12,
          letterSpacing: ".04em",
          color: "rgba(255,255,255,.92)",
          textShadow: "0 1px 3px rgba(0,0,0,.5)",
        }}
      >
        {item.postedAt}
      </span>

      {/* 호버: 딥블루 베일 + 중앙 재생 아이콘 + 하단 '게시물 보기' */}
      <span
        className="ig-veil"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg,rgba(7,31,58,.30) 0%,rgba(7,31,58,.55) 100%)",
        }}
      />
      <span
        className="ig-play"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: 3,
          marginTop: -23,
          marginLeft: -23,
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "rgba(255,255,255,.94)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,.28)",
        }}
      >
        <span
          style={{
            width: 0,
            height: 0,
            borderLeft: "13px solid #0b50a1",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            marginLeft: 3,
          }}
        />
      </span>

      <span
        className="ig-open"
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: 3,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#fff",
        }}
      >
        게시물 보기
        <span aria-hidden style={{ color: "var(--lime)" }}>
          ↗
        </span>
      </span>
    </a>
  );
}

// 인스타 릴스 아이콘(단순화한 필름/재생 글리프)
function ReelGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <path d="M8 2.7l3.4 5.3M14 2.7l3.4 5.3" stroke="#fff" strokeWidth="2" />
      <path d="M10 9.5l5 2.9-5 2.9z" fill="#fff" />
    </svg>
  );
}

function PhotoGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="4"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="9" cy="9" r="2" fill="#fff" />
      <path d="M4 18l5-5 4 4 3-2 4 3" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
