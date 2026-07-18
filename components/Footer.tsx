import type { StoreInfo } from "@/lib/types";

export default function Footer({
  store,
  variant,
}: {
  store: StoreInfo;
  variant: "home" | "owner";
}) {
  const links = [
    { label: "스마트스토어", href: store.smartStoreUrl, ext: true },
    { label: "인스타그램", href: store.instagramUrl, ext: true },
    { label: "유튜브", href: store.youtubeChannelUrl, ext: true },
    variant === "home"
      ? { label: "사장님 소개", href: "/owner", ext: false }
      : { label: "홈", href: "/", ext: false },
  ];

  return (
    <footer
      style={{
        padding: "clamp(44px,6vw,64px) 0",
        background: "#10222C",
        color: "#c8d4d8",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 260px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 2,
              padding: "8px 12px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/yonex-dongtan-logo.png"
              alt="YONEX DONGTAN"
              style={{ height: 26, width: "auto", display: "block" }}
            />
          </span>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#8ea3ab", margin: "16px 0 0" }}>
            {store.name} · {store.official}
            <br />
            {store.address}
          </p>
        </div>
        <div style={{ flex: "0 1 auto", display: "flex", flexWrap: "wrap", gap: 22 }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="footlink"
              {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={{ fontSize: 15, color: "#e6eef0", fontWeight: 500 }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <div
        style={{
          maxWidth: 1240,
          margin: "28px auto 0",
          padding: "20px 24px 0",
          borderTop: "1px solid #2a3d47",
        }}
      >
        <p style={{ fontSize: 12.5, color: "#6f858d", margin: 0 }}>
          요넥스 로고 및 상표는 각 권리자에게 귀속됩니다. 본 페이지는 {store.name}{" "}
          소개용 초기 시안입니다.
        </p>
      </div>
    </footer>
  );
}
