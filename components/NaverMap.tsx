"use client";

import { useEffect, useRef, useState } from "react";

// 네이버 지도(Maps JS API v3). 키는 하드코딩하지 않고 env에서 주입한다.
// - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID : 네이버 클라우드 플랫폼 Maps 인증 Client ID
// - NEXT_PUBLIC_NAVER_MAP_KEY_PARAM : 스크립트 파라미터명(기본 ncpKeyId, 구 키는 ncpClientId)
// 키가 없거나 로드 실패 시 네이버 지도 링크 카드로 폴백한다(페이지는 깨지지 않음).
const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
const KEY_PARAM = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_PARAM || "ncpKeyId";

let scriptPromise: Promise<void> | null = null;
function loadNaverMaps(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { naver?: { maps?: unknown } };
  if (w.naver?.maps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${KEY_PARAM}=${clientId}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("naver maps script load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function NaverMap({
  lat,
  lng,
  zoom = 16,
  name,
  mapUrl,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  name: string;
  mapUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadNaverMaps(CLIENT_ID)
      .then(() => {
        if (cancelled || !ref.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const naver = (window as any).naver;
        if (!naver?.maps) return;
        const center = new naver.maps.LatLng(lat, lng);
        const map = new naver.maps.Map(ref.current, {
          center,
          zoom,
          scaleControl: false,
          mapDataControl: false,
          logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
        });
        const marker = new naver.maps.Marker({ position: center, map, title: name });
        naver.maps.Event.addListener(marker, "click", () =>
          window.open(mapUrl, "_blank", "noopener,noreferrer")
        );
        setOk(true);
      })
      .catch(() => {
        if (!cancelled) setOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, zoom, name, mapUrl]);

  return (
    <div
      data-reveal
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4/3",
        background: "var(--mist)",
        border: "1px solid var(--line)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div ref={ref} style={{ position: "absolute", inset: 0 }} />
      {!ok && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            textAlign: "center",
            color: "var(--ink-soft)",
          }}
        >
          <span
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 700,
              letterSpacing: ".16em",
              fontSize: 13,
              color: "var(--blue)",
            }}
          >
            YONEX DONGTAN
          </span>
          <span style={{ fontSize: 13 }}>네이버 지도에서 길찾기 ↗</span>
        </a>
      )}
    </div>
  );
}
