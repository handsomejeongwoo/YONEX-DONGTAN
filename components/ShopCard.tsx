"use client";

import { useState } from "react";
import type { ShopPick } from "@/lib/types";

const GRID_BG =
  "#EAF1F2 linear-gradient(90deg,transparent calc(50% - .5px),#c6d5d8 calc(50% - .5px),#c6d5d8 calc(50% + .5px),transparent calc(50% + .5px)),linear-gradient(0deg,transparent calc(50% - .5px),#c6d5d8 calc(50% - .5px),#c6d5d8 calc(50% + .5px),transparent calc(50% + .5px))";

export default function ShopCard({ item }: { item: ShopPick }) {
  const [showImg, setShowImg] = useState(false);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="lift card-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#F7F9F8",
        border: "1px solid #dbe5e7",
        borderRadius: 2,
        overflow: "hidden",
        color: "#10222C",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/5",
          background: GRID_BG,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            onLoad={() => setShowImg(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: showImg ? "block" : "none",
            }}
          />
        ) : null}
        <span
          style={{
            position: "relative",
            margin: 12,
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: ".14em",
            fontSize: 11,
            color: "#5b6d73",
            background: "#F7F9F8",
            padding: "4px 8px",
            border: "1px solid #DCE5E7",
          }}
        >
          {item.badge}
        </span>
      </div>
      <div
        style={{
          padding: "16px 18px 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "#0B50A1", fontWeight: 600 }}>
            {item.category}
          </div>
          <div style={{ fontSize: 15, color: "#4a5a61", lineHeight: 1.5, marginTop: 6 }}>
            {item.blurb}
          </div>
        </div>
        <span style={{ fontSize: 20, color: "#0B50A1", flex: "none" }}>→</span>
      </div>
    </a>
  );
}
