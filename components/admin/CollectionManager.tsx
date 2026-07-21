"use client";

import { useMemo, useState } from "react";
import {
  getCollection,
  computeDiscount,
  type CollectionType,
  type Field,
} from "@/lib/admin/collections";

type Item = Record<string, unknown> & { id?: string; order?: number };
type FormState = Record<string, string | boolean>;

const API = (type: string, rest = "") =>
  `/api/admin/collections/${type}${rest}`; // rest 는 "/id" 또는 "/reorder"

function toFormValue(field: Field, item?: Item): string | boolean {
  const v = item?.[field.name];
  if (field.type === "checkbox") return v === undefined ? true : Boolean(v);
  if (field.type === "tags") return Array.isArray(v) ? v.join(", ") : "";
  return v == null ? "" : String(v);
}

function emptyForm(fields: Field[], item?: Item): FormState {
  const f: FormState = {};
  for (const field of fields) f[field.name] = toFormValue(field, item);
  return f;
}

export default function CollectionManager({
  type,
  initialItems,
}: {
  type: CollectionType;
  initialItems: Item[];
}) {
  const def = getCollection(type)!;
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const primaryFields = useMemo(
    () => def.fields.filter((f) => f.primary),
    [def.fields],
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function openNew() {
    setError(null);
    setForm(emptyForm(def.fields));
    setEditing("new");
  }
  function openEdit(item: Item) {
    setError(null);
    setForm(emptyForm(def.fields, item));
    setEditing(item);
  }
  function closeForm() {
    setEditing(null);
    setForm({});
    setError(null);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const isNew = editing === "new";
      const id = isNew ? null : (editing as Item).id;
      const res = await fetch(API(type, isNew ? "/" : `/${id}/`), {
        method: isNew ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        item?: Item;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.item) {
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }
      if (isNew) {
        setItems((prev) => [...prev, data.item as Item]);
        flash("추가되었습니다.");
      } else {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? (data.item as Item) : it)),
        );
        flash("수정되었습니다.");
      }
      closeForm();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Item) {
    if (!confirm(`삭제할까요?\n\n${String(item[def.titleField] ?? item.id)}`)) return;
    setBusy(true);
    try {
      const res = await fetch(API(type, `/${item.id}/`), { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && data.ok) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        flash("삭제되었습니다.");
      } else {
        flash("삭제 실패");
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(item: Item) {
    const next = !(item.visible ?? true);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, visible: next } : it)),
    );
    await fetch(API(type, `/${item.id}/`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visible: next }),
    }).catch(() => {});
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    const ids = next.map((it) => it.id);
    const res = await fetch(API(type, "/reorder/"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    if (res && res.ok) {
      const data = (await res.json().catch(() => ({}))) as { items?: Item[] };
      if (data.items) setItems(data.items);
    }
  }

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{def.label}</h1>
          <p style={{ fontSize: 13, color: "#8ea3ab", margin: "4px 0 0" }}>
            총 {items.length}개 · 위/아래 버튼으로 노출 순서를 바꿉니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          style={btnPrimary}
        >
          + {def.singular} 추가
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e4e9ee",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {items.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", color: "#8ea3ab", fontSize: 14 }}>
            아직 등록된 항목이 없습니다.
          </div>
        )}
        {items.map((item, i) => {
          const visible = (item.visible ?? true) as boolean;
          return (
            <div
              key={String(item.id ?? i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderTop: i === 0 ? "none" : "1px solid #eef2f4",
                opacity: visible ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={arrowBtn}>▲</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} style={arrowBtn}>▼</button>
              </div>

              <ThumbOrIndex item={item} index={i} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#10222c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {String(item[def.titleField] ?? item.id ?? "(제목 없음)")}
                </div>
                <div style={{ fontSize: 12.5, color: "#8ea3ab", marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {primaryFields
                    .filter((f) => f.name !== def.titleField)
                    .map((f) => {
                      const val = item[f.name];
                      if (val == null || val === "") return null;
                      return <span key={f.name}>{f.label}: {String(val)}</span>;
                    })}
                  {type === "products" && (() => {
                    const d = computeDiscount(String(item.originalPrice ?? ""), String(item.price ?? ""));
                    return d ? <span style={{ color: "#c0392b", fontWeight: 700 }}>-{d}%</span> : null;
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleVisible(item)}
                style={{
                  ...pill,
                  color: visible ? "#0b7a3b" : "#9aa7ad",
                  borderColor: visible ? "#bfe6cd" : "#dbe3e7",
                  background: visible ? "#eafaf0" : "#f4f6f8",
                }}
              >
                {visible ? "공개" : "숨김"}
              </button>
              <button type="button" onClick={() => openEdit(item)} style={btnGhost}>수정</button>
              <button type="button" onClick={() => remove(item)} style={btnDanger}>삭제</button>
            </div>
          );
        })}
      </div>

      {editing !== null && (
        <FormModal
          title={editing === "new" ? `${def.singular} 추가` : `${def.singular} 수정`}
          fields={def.fields}
          form={form}
          setForm={setForm}
          onSubmit={submitForm}
          onClose={closeForm}
          busy={busy}
          error={error}
          extra={
            type === "products" ? (
              <DiscountHint original={form.originalPrice as string} price={form.price as string} />
            ) : null
          }
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#10222c",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 60,
            boxShadow: "0 6px 20px rgba(0,0,0,.2)",
          }}
        >
          {toast}
        </div>
      )}
    </section>
  );
}

function ThumbOrIndex({ item, index }: { item: Item; index: number }) {
  const img =
    (item.image as string) ||
    (item.thumbnail as string) ||
    "";
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt=""
        style={{ width: 46, height: 46, borderRadius: 6, objectFit: "cover", background: "#f0f3f5", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{ width: 46, height: 46, borderRadius: 6, background: "#eef2f4", display: "grid", placeItems: "center", color: "#9aa7ad", fontWeight: 800, flexShrink: 0 }}>
      {index + 1}
    </div>
  );
}

function DiscountHint({ original, price }: { original?: string; price?: string }) {
  const d = computeDiscount(original ?? "", price ?? "");
  if (!d) return null;
  return (
    <p style={{ fontSize: 13, color: "#c0392b", fontWeight: 700, margin: "0 0 4px" }}>
      할인율 {d}% (자동 계산)
    </p>
  );
}

function FormModal({
  title,
  fields,
  form,
  setForm,
  onSubmit,
  onClose,
  busy,
  error,
  extra,
}: {
  title: string;
  fields: Field[];
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
  extra?: React.ReactNode;
}) {
  const set = (name: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,34,44,.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90svh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 22,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>{title}</h2>
        {extra}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map((f) => (
            <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {f.type !== "checkbox" && (
                <span style={{ fontSize: 13, fontWeight: 700, color: "#3a4c54" }}>
                  {f.label}
                  {f.required && <span style={{ color: "#c0392b" }}> *</span>}
                </span>
              )}
              <FieldInput field={f} value={form[f.name]} onChange={(v) => set(f.name, v)} />
              {f.help && (
                <span style={{ fontSize: 12, color: "#9aa7ad" }}>{f.help}</span>
              )}
            </label>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "#c0392b", margin: "14px 0 0" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" onClick={onClose} style={btnGhost}>취소</button>
          <button type="submit" disabled={busy} style={btnPrimary}>
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span style={{ fontSize: 14, color: "#3a4c54", fontWeight: 600 }}>{field.label}</span>
      </span>
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        style={{ ...inputBase, resize: "vertical", fontFamily: "inherit" }}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        style={inputBase}
      >
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      style={inputBase}
    />
  );
}

// ---- 스타일 ----
const inputBase: React.CSSProperties = {
  height: 42,
  padding: "0 12px",
  fontSize: 15,
  border: "1px solid #d7dee2",
  borderRadius: 6,
  outlineColor: "#0b50a1",
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
};
const btnPrimary: React.CSSProperties = {
  height: 40,
  padding: "0 16px",
  border: "none",
  borderRadius: 6,
  background: "#0b50a1",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  height: 34,
  padding: "0 12px",
  border: "1px solid #d7dee2",
  borderRadius: 6,
  background: "#fff",
  color: "#10222c",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  height: 34,
  padding: "0 12px",
  border: "1px solid #f0c9c4",
  borderRadius: 6,
  background: "#fff",
  color: "#c0392b",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const arrowBtn: React.CSSProperties = {
  width: 24,
  height: 20,
  border: "1px solid #e0e6ea",
  borderRadius: 4,
  background: "#fff",
  color: "#5b6d73",
  fontSize: 9,
  cursor: "pointer",
  lineHeight: 1,
  padding: 0,
};
const pill: React.CSSProperties = {
  height: 30,
  padding: "0 12px",
  border: "1px solid",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
