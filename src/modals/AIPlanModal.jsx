import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { callOpenRouter } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

export default function AIPlanModal({ onClose, data, model }) {
  const T = useTheme();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      const { transactions, budgetPlan } = data;
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthTx = transactions.filter(t => t.date.startsWith(thisMonth));
      const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const byCategory = CAT
        .map(c => ({ cat: c.label, amount: monthTx.filter(t => t.type === "expense" && t.category === c.id).reduce((s, t) => s + t.amount, 0) }))
        .filter(c => c.amount > 0);

      try {
        const text = await callOpenRouter([{
          role: "user",
          content: `วิเคราะห์การใช้เงินเดือนนี้และให้คำแนะนำเป็นภาษาไทย กระชับ จริงจัง:

รายรับ: ${income} บาท
รายจ่ายรวม: ${expense} บาท
แผนงบ: จำเป็น ${budgetPlan.ratios.need}% / อยากได้ ${budgetPlan.ratios.want}% / ออม ${budgetPlan.ratios.save}%
รายจ่ายแยกหมวด: ${byCategory.map(c => `${c.cat}: ${c.amount}`).join(", ")}

ให้:
1. สรุปสถานะการเงิน (1-2 ประโยค)
2. หมวดที่ใช้เกินแผน (ถ้ามี)
3. 3 วิธีลดรายจ่ายเดือนหน้าที่ทำได้จริง
4. แนะนำสัดส่วนงบเดือนหน้า`,
        }], model, 1000);
        setAnalysis(text || "ไม่สามารถวิเคราะห์ได้");
      } catch { setAnalysis("เกิดข้อผิดพลาด กรุณาลองใหม่"); }
      setLoading(false);
    };
    analyze();
  }, []);

  return (
    <ModalWrapper title="AI วิเคราะห์การใช้จ่าย" onClose={onClose}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: T.accent, fontSize: 14 }}>
            <Sparkles size={20} />กำลังวิเคราะห์...
          </div>
        </div>
      ) : (
        <div style={{ background: T.card2, border: `1px solid ${T.purple}33`, borderRadius: 16, padding: 16, lineHeight: 1.8, fontSize: 14, color: T.text, whiteSpace: "pre-wrap" }}>
          {analysis}
        </div>
      )}
    </ModalWrapper>
  );
}
