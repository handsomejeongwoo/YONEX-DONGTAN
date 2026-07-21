import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientEffects from "@/components/ClientEffects";
import HomeHero from "@/components/HomeHero";
import SmartStorePicks from "@/components/SmartStorePicks";
import NaverMap from "@/components/NaverMap";
import VideoCard from "@/components/VideoCard";
import HomeBanners from "@/components/HomeBanners";
import {
  getStore,
  getHomeVideos,
  getHighlightRecords,
  getFeaturedProducts,
  getActiveBanners,
  getActiveNotice,
} from "@/lib/content-server";

// 관리자에서 수정한 내용이 재빌드 없이 반영되도록 요청 시점 렌더.
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 24px",
};

const EYEBROW: React.CSSProperties = {
  fontFamily: "'Barlow Condensed',sans-serif",
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: ".18em",
  textTransform: "uppercase",
};

export default async function HomePage() {
  const [store, videos, allHighlights, products, banners, notice] =
    await Promise.all([
      getStore(),
      getHomeVideos(6),
      getHighlightRecords(),
      getFeaturedProducts(),
      getActiveBanners(),
      getActiveNotice(),
    ]);
  const highlights = allHighlights.slice(0, 3);

  return (
    <div id="top" style={{ width: "100%", overflowX: "clip" }}>
      {notice && (
        <div className="notice-bar">
          <div className="notice-bar__inner">{notice}</div>
        </div>
      )}

      <Header variant="home" smartStoreUrl={store.smartStoreUrl} />

      {/* ===== HERO — 요넥스 동탄 브랜드 (파랑/초록 5:5 · motion) ===== */}
      <HomeHero />

      {/* ===== 관리자 배너 (등록된 경우에만) ===== */}
      <HomeBanners banners={banners} />

      {/* ===== SMART STORE PICKS — white ===== */}
      <SmartStorePicks products={products} />

      {/* ===== 유튜브 최신 영상 — mist ===== */}
      <section
        id="videos"
        style={{
          scrollMarginTop: 80,
          padding: "clamp(64px,9vw,104px) 0",
          background: "var(--mist)",
        }}
      >
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            Videos
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
            최신 영상
          </h2>
          {videos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,280px),1fr))",
                gap: 16,
                marginTop: "clamp(28px,4vw,44px)",
              }}
            >
              {videos.map((v) => (
                <div key={v.id} data-reveal style={{ display: "flex" }}>
                  <VideoCard item={v} variant="home" />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 24, color: "var(--ink-soft)" }}>
              곧 새로운 영상을 올릴 예정입니다.
            </p>
          )}
          <div data-reveal style={{ marginTop: 22 }}>
            <a
              href={store.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 15, fontWeight: 700, color: "var(--blue)" }}
            >
              채널 전체 보기 ↗
            </a>
          </div>
        </div>
      </section>

      {/* ===== 사장님 신뢰 근거 (짧게) — white (앞의 영상 섹션이 mist 라 대비) ===== */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0", background: "var(--paper)" }}>
        <div style={WRAP}>
          <div
            data-reveal
            className="card"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "clamp(22px,4vw,44px)",
              padding: "clamp(22px,3vw,32px)",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: "0 0 auto",
                width: "clamp(120px,20vw,168px)",
                aspectRatio: "1 / 1",
                background:
                  "linear-gradient(150deg,#0b50a1,#083d7a)",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-photo="/assets/hong-seungin-hero.jpg"
                alt="홍승인 사장님"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 8,
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontSize: 11,
                  letterSpacing: ".14em",
                  color: "rgba(255,255,255,.9)",
                }}
              >
                HONG SEUNG IN
              </span>
            </div>
            <div style={{ flex: "1 1 320px", minWidth: 260 }}>
              <div
                data-reveal
                style={{ ...EYEBROW, color: "var(--green)", fontSize: 13 }}
              >
                YONEX DONGTAN CEO · PLAYER
              </div>
              <p
                data-reveal
                style={{
                  fontSize: "clamp(18px,2.4vw,24px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.35,
                  margin: "10px 0 0",
                }}
              >
                직접 대회를 뛰는 사장님이 장비를 함께 고릅니다.
              </p>
              {highlights.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  {highlights.map((r) => (
                    <span
                      key={r.date}
                      data-reveal
                      style={{
                        display: "inline-flex",
                        alignItems: "baseline",
                        gap: 7,
                        padding: "7px 11px",
                        background: "var(--paper)",
                        border: "1px solid var(--line)",
                        borderRadius: 2,
                        fontSize: 13,
                        color: "var(--ink)",
                      }}
                    >
                      <b
                        style={{
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontSize: 15,
                          color: "var(--blue)",
                        }}
                      >
                        {r.year}
                      </b>
                      {shortTitle(r.title)}
                      <b style={{ color: "var(--green-dark)" }}>{r.result}</b>
                    </span>
                  ))}
                </div>
              )}
              <div data-reveal style={{ marginTop: 20 }}>
                <a href="/owner" className="btn btn-line btn-sm">
                  사장님 프로필 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 오시는 길 / 매장 안내 — white ===== */}
      <section
        id="visit"
        style={{ scrollMarginTop: 80, padding: "clamp(64px,9vw,104px) 0", background: "var(--paper)" }}
      >
        <div style={WRAP}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(32px,5vw,56px)",
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 380px", minWidth: 280 }}>
              <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
                Visit
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
                동탄에서, 직접 보고 고르세요.
              </h2>
              <p
                data-reveal
                style={{
                  fontSize: "clamp(17px,2vw,19px)",
                  lineHeight: 1.6,
                  color: "var(--ink)",
                  margin: "20px 0 0",
                  fontWeight: 600,
                }}
              >
                {store.address}
              </p>
              <p
                data-reveal
                style={{ fontSize: 15, color: "var(--ink-soft)", margin: "8px 0 0" }}
              >
                {store.official} · {store.categories.join(" · ")}
              </p>

              {/* 관리자에서 채운 항목만 노출 */}
              {(store.phone || store.hours || store.closedDay) && (
                <dl
                  data-reveal
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "8px 16px",
                    margin: "20px 0 0",
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  {store.phone && (
                    <>
                      <dt style={{ color: "var(--ink-soft)", fontWeight: 600 }}>전화</dt>
                      <dd style={{ margin: 0 }}>
                        <a href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`} style={{ color: "var(--blue)", fontWeight: 600 }}>
                          {store.phone}
                        </a>
                      </dd>
                    </>
                  )}
                  {store.hours && (
                    <>
                      <dt style={{ color: "var(--ink-soft)", fontWeight: 600 }}>영업시간</dt>
                      <dd style={{ margin: 0 }}>{store.hours}</dd>
                    </>
                  )}
                  {store.closedDay && (
                    <>
                      <dt style={{ color: "var(--ink-soft)", fontWeight: 600 }}>휴무</dt>
                      <dd style={{ margin: 0 }}>{store.closedDay}</dd>
                    </>
                  )}
                </dl>
              )}
              <div
                data-reveal
                style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}
              >
                <a
                  href={store.naverMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  네이버지도에서 길찾기 →
                </a>
              </div>
            </div>
            <div style={{ flex: "1 1 360px", minWidth: 280 }}>
              <NaverMap
                lat={store.naverMap.lat}
                lng={store.naverMap.lng}
                zoom={store.naverMap.zoom}
                name={store.name}
                mapUrl={store.naverMapUrl}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer store={store} variant="home" />
      <ClientEffects />
    </div>
  );
}

// 긴 대회명을 신뢰 칩용 짧은 이름으로 줄입니다.
function shortTitle(title: string): string {
  const cleaned = title
    .replace(/^\d{4}\s*/, "")
    .replace(/전국배드민턴대회/g, "")
    .trim();
  const head = cleaned.split(/\s+/).slice(0, 2).join(" ");
  return head || cleaned;
}
