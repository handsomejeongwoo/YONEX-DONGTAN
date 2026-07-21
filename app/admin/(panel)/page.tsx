import { readContent } from "@/lib/repository/content-repository";

export const dynamic = "force-dynamic";

const CARDS = [
  { href: "/admin/collections/products", label: "추천 상품", key: "products", desc: "스마트스토어 링크 카드" },
  { href: "/admin/collections/youtube", label: "유튜브 영상", key: "youtube", desc: "URL만 붙여넣으면 자동 등록" },
  { href: "/admin/collections/reels", label: "인스타 릴스", key: "instagram", desc: "릴스/이미지 노출 관리" },
  { href: "/admin/collections/achievements", label: "대회 이력", key: "records", desc: "성적 기록 관리" },
  { href: "/admin/collections/banners", label: "배너", key: "banners", desc: "홈 상단 배너" },
  { href: "/admin/store", label: "매장 정보", key: null, desc: "주소·연락처·공지" },
] as const;

export default async function AdminDashboard() {
  const c = await readContent();
  const count = (k: string | null) =>
    k ? ((c as unknown as Record<string, unknown[]>)[k]?.length ?? 0) : null;

  return (
    <section>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 4px" }}>대시보드</h1>
      <p style={{ fontSize: 14, color: "#5b6d73", margin: "0 0 20px" }}>
        홈페이지 콘텐츠를 여기서 관리합니다.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))",
          gap: 12,
        }}
      >
        {CARDS.map((card) => {
          const n = count(card.key);
          return (
            <a
              key={card.href}
              href={card.href}
              style={{
                background: "#fff",
                border: "1px solid #e4e9ee",
                borderRadius: 8,
                padding: "18px 18px",
                display: "block",
                color: "#10222c",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{card.label}</span>
                {n !== null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0b50a1" }}>{n}개</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#8ea3ab", marginTop: 6 }}>{card.desc}</div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
