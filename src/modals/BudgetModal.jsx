import { useState } from "react";
import { T } from "../constants/theme";
import { formatB } from "../utils/format";
import ModalWrapper from "../components/ModalWrapper";

export default function BudgetModal({ onClose, data, onSave }) {
  const [income, setIncome] = useState(data.budgetPlan.income);
  const [ratios, setRatios] = useState(data.budgetPlan.ratios);
  const total = ratios.need + ratios.want + ratios.save;

  return (
    <ModalWrapper title="ตั้งค่าแผนงบ" onClose={onClose}>
      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>รายรับต่อเดือน (บาท)</label>
      <input type="number" value={income} onChange={e => setIncome(parseFloat(e.target.value) || 0)}
        style={{ width: "100%", background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 20, fontFamily: "'Chakra Petch',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />

      {[["need", "จำเป็น", T.blue], ["want", "อยากได้", T.purple], ["save", "ออมทรัพย์", T.green]].map(([k, label, color]) => (
        <div key={k} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color }}>{label}</span>
            <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, color }}>{ratios[k]}% = {formatB((income * ratios[k]) / 100)}</span>
          </div>
          <input type="range" min={0} max={100} value={ratios[k]}
            onChange={e => setRatios(r => ({ ...r, [k]: parseInt(e.target.value) }))}
            style={{ width: "100%", accentColor: color }} />
        </div>
      ))}

      {total !== 100 && (
        <div style={{ background: T.red + "22", border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", color: T.red, fontSize: 13, marginBottom: 16 }}>
          รวม {total}% — ต้องรวมได้ 100% พอดี (ขาด/เกิน {Math.abs(100 - total)}%)
        </div>
      )}

      <button
        onClick={() => { if (total === 100) { onSave({ income, ratios }); onClose(); } }}
        disabled={total !== 100}
        style={{ width: "100%", background: total === 100 ? T.accent : T.border, border: "none", borderRadius: 14, padding: 14, color: total === 100 ? "#000" : T.muted, fontWeight: 700, fontSize: 15, cursor: total === 100 ? "pointer" : "not-allowed", fontFamily: "'Sarabun',sans-serif" }}>
        บันทึกแผน
      </button>
    </ModalWrapper>
  );
}
