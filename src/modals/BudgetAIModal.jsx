import { useState } from "react";
import { Sparkles, RefreshCw, ChevronLeft } from "lucide-react";
import { CAT } from "../constants/categories";
import { T } from "../constants/theme";
import { formatB } from "../utils/format";
import { callOpenRouter } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

const ROLES = [
  {
    id: "cfp",
    emoji: "📊",
    name: "นักวางแผนการเงิน",
    desc: "วิเคราะห์ตัวเลข หลัก 50/30/20",
    color: T.blue,
    system: `คุณคือนักวางแผนการเงินส่วนบุคคล (CFP) ชาวไทย เชี่ยวชาญการจัดสรรงบประมาณ
ตอบเป็นภาษาไทย กระชับ ชัดเจน มีตัวเลขประกอบทุกคำแนะนำ
ใช้หลักการ 50/30/20 และ zero-based budgeting เป็นกรอบอ้างอิง
เน้นการสร้างกองทุนฉุกเฉิน (3-6 เดือนของรายจ่าย) ก่อนลงทุน
จัดรูปแบบเป็นหัวข้อย่อยที่อ่านง่าย มีสรุปท้าย`,
  },
  {
    id: "coach",
    emoji: "💰",
    name: "โค้ชออมเงิน",
    desc: "เน้นออม ลดรายจ่าย จริงจัง",
    color: T.green,
    system: `คุณคือโค้ชด้านการออมเงินที่พูดตรงไปตรงมา จริงจัง ไม่อ้อมค้อม
ตอบเป็นภาษาไทย ใช้ภาษาพูดได้ แต่มีน้ำหนัก
เน้นหาโอกาสลดรายจ่ายที่ไม่จำเป็น และเพิ่มอัตราการออม
ให้ challenge ผู้ใช้อย่างสร้างสรรค์ เช่น "เดือนนี้ลองตัด X ดูสิ จะประหยัดได้ Y บาท"
ให้เป้าหมายที่เป็นรูปธรรมและวัดผลได้จริง`,
  },
  {
    id: "investor",
    emoji: "📈",
    name: "ที่ปรึกษาลงทุน",
    desc: "ทำเงินทำงาน กองทุน หุ้น",
    color: T.accent,
    system: `คุณคือที่ปรึกษาการลงทุนสำหรับมนุษย์เงินเดือนไทย
ตอบเป็นภาษาไทย ใช้ภาษาเข้าใจง่าย ไม่ใช้ศัพท์เทคนิคมากเกิน
แนะนำการจัดสรรเงินที่เหลือลงทุนอย่างฉลาด เช่น กองทุนรวม SSF/RMF/ThaiESG, เงินฝากดอกเบี้ยสูง, หุ้นปันผล
คำนึงถึงความเสี่ยงที่เหมาะสมกับรายได้และภาระของผู้ใช้
ไม่แนะนำเก็งกำไรหรือลงทุนเกินตัว ต้องมีกองฉุกเฉินก่อนเสมอ`,
  },
  {
    id: "parent",
    emoji: "🏠",
    name: "พ่อแม่ผู้ฉลาด",
    desc: "อบอุ่น ประหยัด มองการณ์ไกล",
    color: T.purple,
    system: `คุณคือผู้ใหญ่ใจดี มีประสบการณ์ชีวิต รอบคอบด้านการเงิน
ตอบเป็นภาษาไทย อบอุ่น เป็นกันเอง ใช้สำนวนไทยได้
เน้นความมั่นคงระยะยาว เช่น เตรียมค่ารักษาพยาบาล, เงินเกษียณ, ทุนการศึกษา
แนะนำประหยัดในชีวิตประจำวันแบบจริงจัง แต่ไม่ตระหนี่จนกระทบสุขภาพ
ให้กำลังใจและมีความเมตตา`,
  },
  {
    id: "friend",
    emoji: "☕",
    name: "เพื่อนซี้วัยทำงาน",
    desc: "สบาย ๆ work-life balance",
    color: "#fb923c",
    system: `คุณคือเพื่อนสนิทวัยทำงานที่เข้าใจชีวิตคนเมือง มีความรู้เรื่องการเงินพอสมควร
ตอบเป็นภาษาไทยแบบสบาย ๆ มีมิตรภาพ ใช้ภาษาพูดได้ บางทีใส่อีโมจิ
ไม่บีบให้ประหยัดจนเครียด เน้น work-life balance
แนะนำการใช้เงินที่ทำให้ชีวิตดีขึ้น เช่น ลงทุนในทักษะ, หาประสบการณ์, พักผ่อนบ้าง
แต่ก็เตือนเรื่องกองฉุกเฉินอย่างเป็นเพื่อน`,
  },
];

function buildContext(data) {
  const { transactions, budgetPlan, recurring } = data;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTx   = transactions.filter(t => t.date.startsWith(thisMonth));
  const income    = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense   = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const remaining = (budgetPlan.income || income) - expense;
  const recurringTotal = (recurring || []).reduce((s, r) => s + r.amount, 0);
  const byCategory = CAT
    .map(c => ({ cat: c.label, amount: monthTx.filter(t => t.type === "expense" && t.category === c.id).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.amount > 0)
    .map(c => `${c.cat}: ฿${c.amount.toLocaleString()}`);

  return `ข้อมูลการเงินเดือนนี้:
- รายรับในระบบ: ฿${income.toLocaleString()} (งบตั้งไว้: ฿${(budgetPlan.income||0).toLocaleString()})
- รายจ่ายรวม: ฿${expense.toLocaleString()}
- เงินคงเหลือ: ฿${remaining.toLocaleString()}
- แผนงบ: จำเป็น ${budgetPlan.ratios.need}% / อยากได้ ${budgetPlan.ratios.want}% / ออม ${budgetPlan.ratios.save}%
- รายจ่ายประจำ/เดือน: ฿${recurringTotal.toLocaleString()} (${(recurring||[]).map(r=>r.label).join(", ") || "-"})
- รายจ่ายแยกหมวด: ${byCategory.join(", ") || "ยังไม่มีรายการ"}

กรุณาแนะนำการใช้เงินที่เหลือ ฿${Math.max(remaining, 0).toLocaleString()} อย่างมีประสิทธิภาพ พร้อมแผนที่ทำได้จริงในเดือนนี้`;
}

export default function BudgetAIModal({ onClose, data, model }) {
  const [role, setRole]       = useState(null);
  const [advice, setAdvice]   = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async (selectedRole) => {
    setLoading(true);
    setAdvice("");
    try {
      const text = await callOpenRouter(
        [{ role: "user", content: buildContext(data) }],
        model,
        1500,
        selectedRole.system,
      );
      setAdvice(text || "ไม่สามารถวิเคราะห์ได้");
    } catch { setAdvice("เกิดข้อผิดพลาด กรุณาลองใหม่"); }
    setLoading(false);
  };

  const selectRole = (r) => { setRole(r); fetchAdvice(r); };

  return (
    <ModalWrapper title="AI ที่ปรึกษางบประมาณ" onClose={onClose}>

      {/* Role selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>เลือก AI ที่ปรึกษา</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => selectRole(r)}
              style={{ display: "flex", alignItems: "center", gap: 12, background: role?.id === r.id ? r.color + "22" : T.card2, border: `2px solid ${role?.id === r.id ? r.color : T.border}`, borderRadius: 14, padding: "10px 14px", cursor: "pointer", textAlign: "left", transition: "all .15s", fontFamily: "'Sarabun',sans-serif" }}>
              <span style={{ fontSize: 22 }}>{r.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: role?.id === r.id ? r.color : T.text }}>{r.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{r.desc}</div>
              </div>
              {role?.id === r.id && <Sparkles size={14} color={r.color} />}
            </button>
          ))}
        </div>
      </div>

      {/* Advice area */}
      {role && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: role.color, fontWeight: 600 }}>{role.emoji} {role.name} แนะนำ</div>
            <button onClick={() => fetchAdvice(role)} disabled={loading}
              style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 8px", color: T.muted, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "'Sarabun',sans-serif" }}>
              <RefreshCw size={11} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> สร้างใหม่
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: T.accent, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Sparkles size={18} /> กำลังคิด...
            </div>
          ) : (
            <div style={{ background: T.card2, border: `1px solid ${role.color}33`, borderRadius: 16, padding: 16, lineHeight: 1.9, fontSize: 14, color: T.text, whiteSpace: "pre-wrap", maxHeight: 380, overflowY: "auto" }}>
              {advice}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ModalWrapper>
  );
}
