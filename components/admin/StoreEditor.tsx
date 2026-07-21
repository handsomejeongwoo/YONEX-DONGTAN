"use client";

import { useState } from "react";
import type { StoreInfo } from "@/lib/types";

type Fields = {
  name: string;
  label: string;
  type?: "text" | "url" | "textarea";
  help?: string;
}[];

const GROUPS: { title: string; fields: Fields }[] = [
  {
    title: "기본 정보",
    fields: [
      { name: "name", label: "매장명" },
      { name: "official", label: "공식 표기", help: "예: 요넥스코리아 공식 대리점" },
      { name: "address", label: "주소" },
      { name: "phone", label: "전화번호", help: "예: 031-000-0000" },
      { name: "hours", label: "영업시간", help: "예: 평일 12:00–21:00" },
      { name: "closedDay", label: "휴무", help: "예: 매주 일요일" },
    ],
  },
  {
    title: "링크",
    fields: [
      { name: "smartStoreUrl", label: "스마트스토어", type: "url" },
      { name: "instagramUrl", label: "인스타그램", type: "url" },
      { name: "youtubeChannelUrl", label: "유튜브 채널", type: "url" },
      { name: "naverMapUrl", label: "네이버 지도", type: "url" },
    ],
  },
  {
    title: "상단 공지 (선택)",
    fields: [
      { name: "notice", label: "공지 문구", type: "textarea", help: "비우면 공지 미노출" },
      { name: "noticeStartAt", label: "게시 시작", help: "YYYY-MM-DD (선택)" },
      { name: "noticeEndAt", label: "게시 종료", help: "YYYY-MM-DD (선택)" },
    ],
  },
];

export default function StoreEditor({ initial }: { initial: StoreInfo }) {
  const rec = initial as unknown as Record<string, unknown>;
  const [form, setForm] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    for (const g of GROUPS)
      for (const field of g.fields) f[field.name] = String(rec[field.name] ?? "");
    return f;
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/store/", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setToast("저장되었습니다.");
        window.setTimeout(() => setToast(null), 2200);
      } else {
        setError(data.error ?? "저장 실패");
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 20px" }}>매장 정보</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {GROUPS.map((g) => (
          <div key={g.title} style={{ background: "#fff", border: "1px solid #e4e9ee", borderRadius: 8, padding: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", color: "#10222c" }}>{g.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 14 }}>
              {g.fields.map((field) => (
                <label key={field.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#3a4c54" }}>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.name] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.name]: e.target.value }))}
                      rows={2}
                      style={textareaBase}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[field.name] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.name]: e.target.value }))}
                      style={inputBase}
                    />
                  )}
                  {field.help && <span style={{ fontSize: 12, color: "#9aa7ad" }}>{field.help}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ fontSize: 13, color: "#c0392b", margin: "14px 0 0" }}>{error}</p>}

      <div style={{ marginTop: 18 }}>
        <button type="submit" disabled={busy} style={{ height: 44, padding: "0 24px", border: "none", borderRadius: 6, background: "#0b50a1", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {busy ? "저장 중…" : "저장"}
        </button>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#10222c", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 60 }}>
          {toast}
        </div>
      )}
    </form>
  );
}

const inputBase: React.CSSProperties = {
  height: 42,
  padding: "0 12px",
  fontSize: 15,
  lineHeight: "40px",
  border: "1px solid #d7dee2",
  borderRadius: 6,
  outlineColor: "#0b50a1",
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  color: "#10222c",
};

// textarea 는 여러 줄이라 고정 높이/line-height 를 쓰면 글자가 위로 붙는다.
const textareaBase: React.CSSProperties = {
  ...inputBase,
  height: "auto",
  minHeight: 76,
  lineHeight: 1.5,
  padding: "10px 12px",
  resize: "vertical",
  fontFamily: "inherit",
};
