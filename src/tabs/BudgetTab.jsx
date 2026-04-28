import { Edit3, Sparkles } from "lucide-react";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { formatB } from "../utils/format";

export default function BudgetTab({ data, onEdit, onAI }) {
  const T = useTheme();
  const { budgetPlan, transactions, recurring } = data;
  const { income, ratios } = budgetPlan;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExp  = transactions
    .filter(t => t.date.startsWith(thisMonth) && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const usedPct   = income > 0 ? Math.min((monthExp / income) * 100, 100) : 0;

  const buckets = [
    { key: "need", label: "จำเป็น",    desc: "ค่าเช่า อาหาร ค่าไฟ", color: T.blue },
    { key: "want", label: "อยากได้",   desc: "ช้อปปิ้ง บันเทิง",    color: T.purple },
    { key: "save", label: "ออมทรัพย์", desc: "เก็บไว้/ลงทุน",       color: T.green },
  ];

  return (
    <div style={{ padding: "20px 16px 0" }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>แผนงบประมาณ</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onAI}
            style={{ display: "flex", alignItems: "center", gap: 5, background: T.purple + "22", border: `1px solid ${T.purple}44`, borderRadius: 8, padding: "6px 12px", color: T.purple, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
            <Sparkles size={12} /> AI ที่ปรึกษา
          </button>
          <button onClick={onEdit}
            style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: "6px 12px", color: T.accent, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <Edit3 size={12} /> แก้ไข
          </button>
        </div>
      </div>

      {/* Income summary card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: T.muted }}>รายรับเดือนนี้</div>
        <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 28, fontWeight: 700, color: T.green }}>{formatB(income)}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
          ใช้ไปแล้ว {formatB(monthExp)} · เหลือ <span style={{ color: income - monthExp < 0 ? T.red : T.text }}>{formatB(income - monthExp)}</span>
        </div>
        <div style={{ marginTop: 8, background: T.border, borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${usedPct}%`, height: "100%", background: usedPct > 90 ? T.red : T.green, borderRadius: 8, transition: "width .5s" }} />
        </div>
      </div>

      {/* Bucket cards */}
      {buckets.map(b => {
        const allocated = (income * ratios[b.key]) / 100;
        return (
          <div key={b.key} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: b.color }}>
                  {b.label} <span style={{ fontSize: 12, color: T.muted }}>({ratios[b.key]}%)</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted }}>{b.desc}</div>
              </div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 16, fontWeight: 700 }}>{formatB(allocated)}</div>
            </div>
            <div style={{ background: T.border, borderRadius: 8, height: 4 }}>
              <div style={{ width: `${ratios[b.key]}%`, height: "100%", background: b.color, borderRadius: 8 }} />
            </div>
          </div>
        );
      })}

      {/* Recurring */}
      {recurring?.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>รายจ่ายประจำ</div>
            <div style={{ fontSize: 12, color: T.muted }}>รวม {formatB(recurring.reduce((s, r) => s + r.amount, 0))}/เดือน</div>
          </div>
          {recurring.map((r, i) => {
            const cat  = CAT.find(c => c.id === r.category) ?? CAT[CAT.length - 1];
            const Icon = cat.icon;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < recurring.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{r.label || "ไม่มีชื่อ"}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>ทุกวันที่ {r.dueDay}</div>
                </div>
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, color: T.red }}>-{formatB(r.amount)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
