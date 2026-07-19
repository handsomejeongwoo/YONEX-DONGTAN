"use client";

import { useState } from "react";
import type { YoutubeItem } from "@/lib/types";

const GRID_BG =
  "#0d1b22 linear-gradient(90deg,transparent calc(50% - .5px),#26414b calc(50% - .5px),#26414b calc(50% + .5px),transparent calc(50% + .5px)),linear-gradient(0deg,transparent calc(50% - .5px),#26414b calc(50% - .5px),#26414b calc(50% + .5px),transparent calc(50% + .5px))";

export default function VideoCard({
  item,
  variant,
}: {
  item: YoutubeItem;
  variant: "home" | "owner";
}) {
  const [broken, setBroken] = useState(false);

  const container =
    variant === "home"
      ? {
          background: "#F7F9F8",
          border: "1px solid #dbe5e7",
          borderRadius: "2px",
        }
      : {
          background: "#fff",
          border: 0,
          borderRadius: "2px",
        };

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "home" ? "lift card-hover" : "lift"}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        overflow: "hidden",
        color: "#10222C",
        ...container,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          background: GRID_BG,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!broken && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            onError={() => setBroken(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <span
          style={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 0,
              height: 0,
              borderLeft: "14px solid #0B50A1",
              borderTop: "9px solid transparent",
              borderBottom: "9px solid transparent",
              marginLeft: 4,
            }}
          />
        </span>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: ".14em",
            fontSize: 11,
            color: "#cfe0e6",
          }}
        >
          {item.badge}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          padding: "18px 20px 20px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "#0B50A1",
            background: "#e3edf6",
            padding: "3px 9px",
            borderRadius: 2,
            whiteSpace: "nowrap",
          }}
        >
          {item.category}
        </span>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.4,
            marginTop: 12,
            letterSpacing: "-0.02em",
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#0B50A1",
            fontWeight: 600,
            marginTop: "auto",
            paddingTop: 14,
          }}
        >
          YouTube에서 보기 ↗
        </div>
      </div>
    </a>
  );
}
