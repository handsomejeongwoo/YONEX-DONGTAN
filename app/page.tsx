import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientEffects from "@/components/ClientEffects";
import HomeHero from "@/components/HomeHero";
import SmartStorePicks from "@/components/SmartStorePicks";
import NaverMap from "@/components/NaverMap";
import VideoCard from "@/components/VideoCard";
import {
  store,
  homeVideos,
  highlightRecords,
} from "@/lib/content";

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

// 요넥스 동탄점만의 장점(경기 경험 기반 선택 + 정확한 작업).
const CARE = [
  {
    n: "01",
    title: "플레이 스타일 기반 라켓 추천",
    desc: "단식·복식, 전위·후위 선호, 스매시와 드라이브 비중, 현재 라켓의 무게·밸런스·샤프트 강도를 함께 확인합니다. 직접 사용해본 경험을 바탕으로 내 스윙에 맞는 요넥스 라켓을 추천합니다.",
  },
  {
    n: "02",
    title: "네매듭 공식 대리점",
    desc: "2매듭·4매듭 등 다양한 스트링 방식 중에서 선택할 수 있습니다. 스트링의 반발력과 컨트롤 성향, 게이지, 원하는 텐션을 고려해 라켓 특성과 플레이 스타일에 맞는 조합으로 타구감이 살아나는 세팅을 제안합니다.",
  },
  {
    n: "03",
    title: "신발 · 웨어 피팅",
    desc: "발볼과 착화감, 코트에서의 움직임을 기준으로 배드민턴화를 함께 고릅니다. 시즌별 요넥스 신상 웨어도 매장에서 직접 입어 보고, 사이즈와 핏을 확인한 뒤 선택할 수 있습니다.",
  },
];

export default function HomePage() {
  const videos = homeVideos(3);
  const highlights = highlightRecords().slice(0, 3);

  return (
    <div id="top" style={{ width: "100%", overflowX: "hidden" }}>
      <Header variant="home" smartStoreUrl={store.smartStoreUrl} />

      {/* ===== HERO — 요넥스 동탄 브랜드 (파랑/초록 5:5 · motion) ===== */}
      <HomeHero official={store.official} />

      {/* ===== 어떤 고민을 같이 봐드리나요 (white) ===== */}
      <section
        id="about"
        style={{ scrollMarginTop: 80, padding: "clamp(64px,9vw,104px) 0", background: "var(--paper)" }}
      >
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            매장 소개
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
            경기 경험으로 고르고,
            <br />
            정확한 작업으로 완성합니다.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
              gap: 14,
              marginTop: "clamp(28px,4vw,44px)",
            }}
          >
            {CARE.map((c) => (
              <div
                key={c.n}
                data-reveal
                className="card care-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "26px 24px 22px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 34,
                    lineHeight: 1,
                    color: "var(--blue)",
                  }}
                >
                  {c.n}
                </span>
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    marginTop: 16,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.title}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--ink-soft)",
                    marginTop: 8,
                    flex: 1,
                  }}
                >
                  {c.desc}
                </span>
                <span
                  className="care-rule"
                  style={{
                    height: 3,
                    background: "var(--blue)",
                    marginTop: 18,
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 사장님 신뢰 근거 (짧게) — mist ===== */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0", background: "var(--mist)" }}>
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
                  사장님 상담 방식 · 선수 기록 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SMART STORE PICKS — white ===== */}
      <SmartStorePicks />

      {/* ===== 유튜브 최신 영상 3 — mist ===== */}
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
            YouTube — 배드민턴 홍승인
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
                <div key={v.id} data-reveal>
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
                오시는 길
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
