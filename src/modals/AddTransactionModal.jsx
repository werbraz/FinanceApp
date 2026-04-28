import { useState } from "react";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { today } from "../utils/format";
import ModalWrapper from "../components/ModalWrapper";

export default function AddTransactionModal({ onClose, onSave }) {
  const T = useTheme();
  const [form, setForm] = useState({ type: "expense", amount: "", category: "food", note: "", date: today() });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.amount) return;
    onSave({ ...form, amount: parseFloat(form.amount), source: "manual" });
    onClose();
  };

  return (
    <ModalWrapper title="เพิ่มรายการ" onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["expense", "income"].map(t => (
          <button key={t} onClick={() => set("type", t)}
            style={{ flex: 1, padding: 10, border: `1px solid ${form.type === t ? (t === "income" ? T.green : T.red) : T.border}`, borderRadius: 12, background: form.type === t ? (t === "income" ? T.green + "22" : T.red + "22") : "transparent", color: form.type === t ? (t === "income" ? T.green : T.red) : T.muted, cursor: "pointer", fontSize: 13, fontFamily: "'Sarabun',sans-serif", fontWeight: 600 }}>
            {t === "expense" ? "💸 รายจ่าย" : "💰 รายรับ"}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>จำนวนเงิน (บาท)</label>
      <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00"
        style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 24, fontFamily: "'Chakra Petch',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>บันทึกย่อ</label>
      <input type="text" value={form.note} onChange={e => set("note", e.target.value)} placeholder="ระบุรายละเอียด..."
        style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, fontFamily: "'Sarabun',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />

      {form.type === "expense" && (
        <>
          <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 8 }}>หมวดหมู่</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {CAT.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => set("category", c.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid ${form.category === c.id ? c.color : T.border}`, borderRadius: 20, background: form.category === c.id ? c.color + "22" : "transparent", color: form.category === c.id ? c.color : T.muted, cursor: "pointer", fontSize: 12, fontFamily: "'Sarabun',sans-serif" }}>
                  <Icon size={12} />{c.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>วันที่</label>
      <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
        style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, fontFamily: "'Sarabun',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />

      <button onClick={save}
        style={{ width: "100%", background: T.accent, border: "none", borderRadius: 14, padding: 14, color: "#000", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
        บันทึกรายการ
      </button>
    </ModalWrapper>
  );
}
