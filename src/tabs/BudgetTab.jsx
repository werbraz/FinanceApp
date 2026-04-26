import { Edit3 } from "lucide-react";
import { CAT } from "../constants/categories";
import { T } from "../constants/theme";
import { formatB } from "../utils/format";

export default function BudgetTab({ data, onEdit }) {
  const { budgetPlan, transactions, recurring } = data;
  const { income, ratios } = budgetPlan;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExp = transactions
    .filter(t => t.date.startsWith(thisMonth) && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const buckets = [
    { key: "need", label: "จำเป็น",    desc: "ค่าเช่า อาหาร ค่าไฟ", color: T.blue },
    { key: "want", label: "อยากได้",   desc: "ช้อปปิ้ง บันเทิง",    color: T.purple },
    { key: "save", label: "ออมทรัพย์", desc: "เก็บไว้/ลงทุน",       color: T.green },
  ];

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>แผนงบประมาณ</div>
        <button onClick={onEdit} style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: "6px 12px", color: T.accent, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
          <Edit3 size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />แก้ไข
        </button>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: T.muted }}>รายรับเดือนนี้</div>
        <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 28, fontWeight: 700, color: T.green }}>{formatB(income)}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>ใช้ไปแล้ว {formatB(monthExp)} · เหลือ {formatB(income - monthExp)}</div>
        <div style={{ marginTop: 8, background: T.border, borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${Math.min((monthExp / income) * 100, 100)}%`, height: "100%", background: monthExp / income > 0.9 ? T.red : T.green, borderRadius: 8, transition: "width .5s" }} />
        </div>
      </div>

      {buckets.map(b => {
        const allocated = (income * ratios[b.key]) / 100;
        return (
          <div key={b.key} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: b.color }}>{b.label} <span style={{ fontSize: 12, color: T.muted }}>({ratios[b.key]}%)</span></div>
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

      {recurring?.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>รายจ่ายประจำ</div>
          {recurring.map(r => {
            const cat = CAT.find(c => c.id === r.category) ?? CAT[CAT.length - 1];
            const Icon = cat.icon;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={cat.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{r.label}</div>
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
