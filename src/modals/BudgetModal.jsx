import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { formatB } from "../utils/format";
import ModalWrapper from "../components/ModalWrapper";

const BUCKETS = [
  { key: "need", label: "จำเป็น",    desc: "ค่าเช่า อาหาร ค่าไฟ",  color: T.blue },
  { key: "want", label: "อยากได้",   desc: "ช้อปปิ้ง บันเทิง",     color: T.purple },
  { key: "save", label: "ออมทรัพย์", desc: "เก็บไว้/ลงทุน",        color: T.green },
];

export default function BudgetModal({ onClose, data, onSave }) {
  const T = useTheme();
  const [income, setIncome]       = useState(data.budgetPlan.income);
  const [ratios, setRatios]       = useState({ ...data.budgetPlan.ratios });
  const [recurring, setRecurring] = useState(data.recurring ? [...data.recurring] : []);

  const total = ratios.need + ratios.want + ratios.save;
  const remaining = 100 - total;

  const setRatio = (key, val) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    setRatios(r => ({ ...r, [key]: num }));
  };

  const autoBalance = () => {
    if (total === 100) return;
    const diff = 100 - total;
    setRatios(r => ({ ...r, save: Math.max(0, r.save + diff) }));
  };

  // Recurring CRUD
  const addRecurring = () =>
    setRecurring(r => [...r, { id: Date.now(), label: "", amount: 0, dueDay: 1, category: "other" }]);
  const deleteRecurring = (id) =>
    setRecurring(r => r.filter(x => x.id !== id));
  const updateRecurring = (id, field, val) =>
    setRecurring(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));

  const canSave = total === 100 && income > 0;

  return (
    <ModalWrapper title="ตั้งค่าแผนงบ" onClose={onClose}>

      {/* Income */}
      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>รายรับต่อเดือน (บาท)</label>
      <input type="number" value={income} onChange={e => setIncome(parseFloat(e.target.value) || 0)}
        style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 20, fontFamily: "'Chakra Petch',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />

      {/* Budget buckets */}
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>สัดส่วนงบประมาณ (รวมต้องได้ 100%)</div>
      {BUCKETS.map(b => (
        <div key={b.key} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: b.color }}>{b.label}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{b.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, color: b.color }}>{formatB((income * ratios[b.key]) / 100)}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="range" min={0} max={100} value={ratios[b.key]}
              onChange={e => setRatio(b.key, e.target.value)}
              style={{ flex: 1, accentColor: b.color }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <input type="number" min={0} max={100} value={ratios[b.key]}
                onChange={e => setRatio(b.key, e.target.value)}
                style={{ width: 52, background: T.card2, border: `1px solid ${b.color}66`, borderRadius: 8, padding: "4px 6px", color: b.color, fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, fontWeight: 700, outline: "none", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: T.muted }}>%</span>
            </div>
          </div>
        </div>
      ))}

      {/* Total indicator */}
      {total !== 100 ? (
        <div style={{ background: T.red + "18", border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", color: T.red, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>รวม {total}% ({remaining > 0 ? `เหลือ ${remaining}%` : `เกิน ${-remaining}%`})</span>
          <button onClick={autoBalance}
            style={{ background: T.red + "33", border: "none", borderRadius: 8, padding: "4px 10px", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
            ปรับอัตโนมัติ
          </button>
        </div>
      ) : (
        <div style={{ background: T.green + "15", border: `1px solid ${T.green}44`, borderRadius: 10, padding: "8px 14px", color: T.green, fontSize: 13, marginBottom: 12 }}>
          ✓ รวม 100% — จัดสรรครบแล้ว
        </div>
      )}

      {/* Recurring items */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>รายจ่ายประจำ</div>
            {recurring.length > 0 && (
              <div style={{ fontSize: 11, color: T.muted }}>รวม {formatB(recurring.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0))}/เดือน</div>
            )}
          </div>
          <button onClick={addRecurring}
            style={{ display: "flex", alignItems: "center", gap: 5, background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 10, padding: "6px 12px", color: T.accent, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
            <Plus size={13} /> เพิ่มรายการ
          </button>
        </div>

        {recurring.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: T.muted }}>ยังไม่มีรายจ่ายประจำ</div>
        )}

        {recurring.map(r => (
          <div key={r.id} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
            {/* Label */}
            <input type="text" value={r.label} placeholder="ชื่อรายการ เช่น Netflix"
              onChange={e => updateRecurring(r.id, "label", e.target.value)}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, padding: "4px 0", color: T.text, fontSize: 14, fontFamily: "'Sarabun',sans-serif", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

            <div style={{ display: "flex", gap: 8 }}>
              {/* Amount */}
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>จำนวนเงิน (฿)</div>
                <input type="number" value={r.amount} min={0}
                  onChange={e => updateRecurring(r.id, "amount", parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.red, fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Due day */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>วันที่</div>
                <input type="number" value={r.dueDay} min={1} max={31}
                  onChange={e => updateRecurring(r.id, "dueDay", parseInt(e.target.value) || 1)}
                  style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.text, fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              {/* Delete */}
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                <button onClick={() => deleteRecurring(r.id)}
                  style={{ background: T.red + "18", border: "none", borderRadius: 8, padding: "6px 8px", color: T.red, cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Category */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>หมวดหมู่</div>
              <select value={r.category} onChange={e => updateRecurring(r.id, "category", e.target.value)}
                style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.text, fontSize: 13, fontFamily: "'Sarabun',sans-serif", outline: "none" }}>
                {CAT.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { if (canSave) { onSave({ income, ratios }, recurring); onClose(); } }}
        disabled={!canSave}
        style={{ width: "100%", background: canSave ? T.accent : T.border, border: "none", borderRadius: 14, padding: 14, color: canSave ? "#000" : T.muted, fontWeight: 700, fontSize: 15, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "'Sarabun',sans-serif" }}>
        บันทึกแผน
      </button>
    </ModalWrapper>
  );
}
