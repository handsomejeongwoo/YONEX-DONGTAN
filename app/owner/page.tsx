import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientEffects from "@/components/ClientEffects";
import VideoCard from "@/components/VideoCard";
import InstagramCard from "@/components/InstagramCard";
// metadata 는 모듈 스코프라 정적 스냅샷을 사용한다(빌드 시점).
import { store as staticStore, owner as staticOwner } from "@/lib/content";
import {
  getStore,
  getOwner,
  getAllRecords,
  getOwnerMatchVideos,
  getOwnerGearVideos,
  getFeaturedInstagram,
} from "@/lib/content-server";

// 관리자 수정이 재빌드 없이 반영되도록 요청 시점 렌더.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${staticOwner.name} · ${staticStore.name} 오너 · 배드민턴 플레이어`,
  description: `${staticStore.name} ${staticOwner.name}. 코트에서 검증한 감각으로 장비를 함께 맞춥니다. 대회 기록과 경기 영상.`,
};

const WRAP: React.CSSProperties = {
  maxWidth: 1160,
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

// 소개 카드(선수 프로필 톤 — 사실 중심, 3개).
const profileCards = (storeName: string) => [
  {
    n: "01",
    title: `${storeName} 운영`,
    desc: "라켓부터 의류까지, 매장에서 직접 이야기 나눕니다.",
  },
  {
    n: "02",
    title: "경기 경험 기반 상담",
    desc: "플레이 스타일과 현재 라켓 세팅부터 같이 봅니다.",
  },
  {
    n: "03",
    title: "유튜브 · 인스타그램",
    desc: "경기와 장비 이야기를 코트 밖에서도 기록으로 남깁니다.",
  },
];

// 결과별 위계 스타일.
function resultStyle(result: string): {
  badge: React.CSSProperties;
  win: boolean;
  runner: boolean;
} {
  if (result === "우승") {
    return {
      win: true,
      runner: false,
      badge: { background: "var(--blue)", color: "#fff", border: "1px solid var(--blue)" },
    };
  }
  if (result === "준우승") {
    return {
      win: false,
      runner: true,
      badge: {
        background: "transparent",
        color: "var(--blue)",
        border: "1px solid var(--blue)",
      },
    };
  }
  return {
    win: false,
    runner: false,
    badge: {
      background: "var(--mist)",
      color: "var(--ink-soft)",
      border: "1px solid var(--line)",
    },
  };
}

export default async function OwnerPage() {
  const [store, owner, records, matches, gear, instagram] = await Promise.all([
    getStore(),
    getOwner(),
    getAllRecords(),
    getOwnerMatchVideos(6),
    getOwnerGearVideos(2),
    getFeaturedInstagram(6),
  ]);
  const PROFILE = profileCards(store.name);

  return (
    <div id="top" style={{ width: "100%", overflowX: "hidden" }}>
      <Header variant="owner" smartStoreUrl={store.smartStoreUrl} />

      {/* ===== 선수 프로필 히어로 (라이트 · 사진 주도) ===== */}
      <section style={{ background: "var(--paper)" }}>
        <div style={{ ...WRAP, paddingTop: "clamp(32px,5vw,56px)", paddingBottom: "clamp(36px,5vw,60px)" }}>
          <Link
            data-reveal
            href="/"
            prefetch
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: ".12em",
              color: "var(--ink-soft)",
            }}
          >
            ← YONEX DONGTAN
          </Link>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
              gap: "clamp(28px,4vw,56px)",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {/* 사진 */}
            <div
              data-reveal
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                background: "linear-gradient(150deg,#0b50a1,#072f5e)",
                border: "1px solid var(--line)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-photo="/assets/hong-seungin-hero.jpg"
                alt="홍승인 경기 모습"
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
                  left: 14,
                  bottom: 12,
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  fontSize: 12,
                  color: "#fff",
                  textShadow: "0 1px 4px rgba(0,0,0,.5)",
                }}
              >
                MATCH DAY
              </span>
            </div>

            {/* 텍스트 (정렬 · 절제) */}
            <div>
              <div
                className="owner-profile-reveal owner-profile-reveal--1"
                style={{ ...EYEBROW, color: "var(--blue)", marginBottom: 12 }}
              >
                YONEX DONGTAN CEO · PLAYER
              </div>
              <div
                className="owner-profile-reveal owner-profile-reveal--2"
                style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(30px,5vw,52px)",
                  letterSpacing: ".08em",
                  lineHeight: 1,
                  color: "var(--blue)",
                }}
              >
                HONG SEUNG IN
              </div>
              <h1
                className="owner-profile-reveal owner-profile-reveal--3"
                style={{
                  fontSize: "clamp(34px,5vw,58px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  margin: "6px 0 0",
                }}
              >
                홍승인
              </h1>
              <div
                className="owner-profile-reveal owner-profile-reveal--4"
                style={{
                  ...EYEBROW,
                  color: "var(--ink-soft)",
                  marginTop: 12,
                }}
              >
                Owner · Player
              </div>
              <p
                className="owner-profile-reveal owner-profile-reveal--5"
                style={{
                  fontSize: "clamp(18px,2.2vw,22px)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  margin: "22px 0 0",
                  maxWidth: "22em",
                }}
              >
                코트에서 검증한 감각,
                <br />
                매장에서 함께 맞춥니다.
              </p>
              <div
                className="owner-profile-reveal owner-profile-reveal--6"
                style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}
              >
                <a href="#records" className="btn btn-primary">
                  검증된 입상 기록
                </a>
                <a
                  href={owner.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-line"
                >
                  유튜브 보기 ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 다크 블루 메타 밴드 (합산 수치 대신 역할·연도 범위) */}
        <div style={{ background: "var(--blue-deep)", color: "#fff" }}>
          <div
            style={{
              ...WRAP,
              display: "flex",
              flexWrap: "wrap",
              gap: "14px 40px",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 20,
              fontFamily: "'Barlow Condensed',sans-serif",
              letterSpacing: ".06em",
            }}
          >
            <span style={{ fontSize: 15, color: "#BFD4EB" }}>
              {store.name} CEO · BADMINTON PLAYER
            </span>
            <span style={{ fontSize: 15 }}>
              <span style={{ color: "#BFD4EB" }}>출전 등급</span> 준자강 · A
            </span>
          </div>
        </div>
      </section>

      {/* ===== Profile / Owner & Player — white ===== */}
      <section style={{ padding: "clamp(56px,8vw,96px) 0", background: "var(--paper)" }}>
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            Profile
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px,3.8vw,42px)",
              lineHeight: 1.14,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: "12px 0 0",
            }}
          >
            경기 경험을 바탕으로, 맞는 선택을 돕습니다.
          </h2>
          <p
            data-reveal
            style={{
              fontSize: "clamp(16px,1.8vw,18px)",
              lineHeight: 1.65,
              color: "var(--ink-soft)",
              margin: "14px 0 0",
              maxWidth: "40em",
            }}
          >
            코트에서 직접 써본 장비만 이야기합니다. 과한 추천보다, 지금 플레이에
            맞는 선택을 함께 찾습니다.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))",
              gap: 14,
              marginTop: "clamp(28px,4vw,44px)",
            }}
          >
            {PROFILE.map((c) => (
              <div
                key={c.n}
                data-reveal
                className="card"
                style={{ padding: "24px 22px" }}
              >
                <div
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--blue)",
                  }}
                >
                  {c.n}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 12,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "var(--ink-soft)",
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {c.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Career Timeline — mist ===== */}
      <section
        id="records"
        style={{ scrollMarginTop: 80, padding: "clamp(56px,8vw,96px) 0", background: "var(--mist)" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            Career Timeline
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px,3.8vw,42px)",
              lineHeight: 1.14,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: "12px 0 0",
            }}
          >
            코트에서 확인된 기록
          </h2>
          <div style={{ marginTop: "clamp(28px,4vw,44px)", position: "relative" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 8,
                top: 8,
                bottom: 8,
                width: 2,
                background:
                  "linear-gradient(var(--blue),rgba(11,80,161,.25))",
              }}
            />
            {records.map((r) => {
              const rs = resultStyle(r.result);
              return (
                <div
                  key={r.date + r.partner}
                  data-reveal
                  style={{ position: "relative", padding: "0 0 26px 40px" }}
                >
                  {/* 노드 — 우승은 채운 블루 + 라임 포인트 */}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: rs.win ? "var(--blue)" : "var(--paper)",
                      border: `3px solid ${rs.win || rs.runner ? "var(--blue)" : "#b7c2c8"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {rs.win && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--lime)",
                        }}
                      />
                    )}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "8px 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontWeight: 700,
                        fontSize: 26,
                        color: "var(--blue)",
                        lineHeight: 1,
                      }}
                    >
                      {r.year}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 24,
                        padding: "0 10px",
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                        ...rs.badge,
                      }}
                    >
                      {r.result}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      marginTop: 8,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.4,
                      color: rs.win || rs.runner ? "var(--ink)" : "#41535a",
                    }}
                  >
                    {r.title}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
                    파트너 · {r.partner}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12.5, color: "#85959a", margin: "6px 0 0" }}>
            동일 대회 복수 종목·플랫폼 분산 기록이 있어 우승 횟수를 합산 표기하지
            않습니다.
          </p>
        </div>
      </section>

      {/* ===== 상담·작업 방식 (경기 경험 기반) — white ===== */}
      <section
        id="about"
        style={{ scrollMarginTop: 80, padding: "clamp(64px,9vw,104px) 0", background: "var(--paper)" }}
      >
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            About
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

      {/* ===== Match Film — deep blue ===== */}
      <section style={{ padding: "clamp(56px,8vw,96px) 0", background: "var(--blue-deep)" }}>
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "#8FD0A2" }}>
            Match Film
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px,3.8vw,42px)",
              lineHeight: 1.14,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              color: "#fff",
              margin: "12px 0 0",
            }}
          >
            경기 영상
          </h2>
          {matches.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,270px),1fr))",
                gap: 16,
                marginTop: "clamp(28px,4vw,44px)",
              }}
            >
              {matches.map((v) => (
                <div key={v.id} data-reveal>
                  <VideoCard item={v} variant="owner" />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 24, color: "#DCEBFA" }}>
              경기 영상을 준비 중입니다.
            </p>
          )}
        </div>
      </section>

      {/* ===== Gear Talk — white ===== */}
      {gear.length > 0 && (
        <section style={{ padding: "clamp(56px,8vw,96px) 0", background: "var(--paper)" }}>
          <div style={WRAP}>
            <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
              Gear Talk
            </div>
            <h2
              data-reveal
              style={{
                fontSize: "clamp(26px,3.8vw,42px)",
                lineHeight: 1.14,
                letterSpacing: "-0.04em",
                fontWeight: 800,
                margin: "12px 0 0",
              }}
            >
              장비 이야기
            </h2>
            <p data-reveal style={{ fontSize: 15, color: "var(--ink-soft)", margin: "14px 0 0" }}>
              코트에서 직접 써본 장비만 이야기합니다.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,300px),1fr))",
                gap: 16,
                marginTop: "clamp(28px,4vw,44px)",
              }}
            >
              {gear.map((v) => (
                <div key={v.id} data-reveal>
                  <VideoCard item={v} variant="home" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Instagram / Court Life — mist ===== */}
      <section style={{ padding: "clamp(56px,8vw,96px) 0", background: "var(--mist)" }}>
        <div style={WRAP}>
          <div data-reveal style={{ ...EYEBROW, color: "var(--blue)" }}>
            Instagram / Court Life
          </div>
          <h2
            data-reveal
            style={{
              fontSize: "clamp(26px,3.8vw,42px)",
              lineHeight: 1.14,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: "12px 0 0",
            }}
          >
            매장과 코트의 순간들
          </h2>
          {instagram.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginTop: "clamp(28px,4vw,44px)",
              }}
            >
              {instagram.map((g) => (
                <div key={g.id} data-reveal>
                  <InstagramCard item={g} />
                </div>
              ))}
            </div>
          )}
          <div data-reveal style={{ marginTop: "clamp(22px,4vw,32px)" }}>
            <a
              href={store.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 15, fontWeight: 700, color: "var(--blue)" }}
            >
              @yonex_dongtan에서 더 보기 ↗
            </a>
          </div>
        </div>
      </section>

      {/* ===== Official dealer mark ===== */}
      <section
        style={{
          padding: "clamp(48px,8vw,88px) 24px",
          background: "#fff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/yonex-dongtan-certified-dealer.png"
          alt="요넥스 공식 인증 대리점 요넥스 동탄점"
          style={{
            display: "block",
            width: "min(100%, 760px)",
            height: "auto",
            margin: "0 auto",
          }}
        />
      </section>

      <Footer store={store} variant="owner" />
      <ClientEffects />
    </div>
  );
}
