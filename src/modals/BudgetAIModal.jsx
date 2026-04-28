import { useState } from "react";
import { Sparkles, RefreshCw, ShoppingBag, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { formatB } from "../utils/format";
import { callOpenRouter } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

// ─── AI Roles ────────────────────────────────────────────────────────────────
const ROLES = [
  { id: "cfp",      emoji: "📊", name: "CFP",        color: "#60a5fa",
    system: `นักวางแผนการเงิน CFP ชาวไทย เน้นตัวเลข หลัก 50/30/20 กองฉุกเฉิน และการลงทุน
ตอบภาษาไทย ตอบ 3 ข้อเท่านั้น แต่ละข้อไม่เกิน 25 คำ รูปแบบ: • ข้อความ` },
  { id: "coach",    emoji: "💰", name: "โค้ชออม",    color: "#34d399",
    system: `โค้ชออมเงิน พูดตรง จริงจัง เน้นลดรายจ่ายและเพิ่มการออม
ตอบภาษาไทย ตอบ 3 ข้อเท่านั้น แต่ละข้อไม่เกิน 25 คำ รูปแบบ: • ข้อความ` },
  { id: "investor", emoji: "📈", name: "นักลงทุน",   color: "#f0c040",
    system: `ที่ปรึกษาลงทุน เน้น SSF/RMF/กองทุน/หุ้นปันผล ทำเงินทำงาน ไม่เสี่ยงเกิน
ตอบภาษาไทย ตอบ 3 ข้อเท่านั้น แต่ละข้อไม่เกิน 25 คำ รูปแบบ: • ข้อความ` },
  { id: "parent",   emoji: "🏠", name: "พ่อแม่ฉลาด", color: "#a78bfa",
    system: `ผู้ใหญ่รอบคอบ อบอุ่น เน้นความมั่นคง เกษียณ สุขภาพ ครอบครัว
ตอบภาษาไทย ตอบ 3 ข้อเท่านั้น แต่ละข้อไม่เกิน 25 คำ รูปแบบ: • ข้อความ` },
  { id: "friend",   emoji: "☕", name: "เพื่อนซี้",  color: "#fb923c",
    system: `เพื่อนวัยทำงาน สบาย work-life balance ไม่ตึงเครียด แต่มีสติ
ตอบภาษาไทย ตอบ 3 ข้อเท่านั้น แต่ละข้อไม่เกิน 25 คำ รูปแบบ: • ข้อความ` },
];

// ─── Data helpers ─────────────────────────────────────────────────────────────
function calcMonthStats(data) {
  const { transactions, budgetPlan, recurring } = data;
  const thisMonth   = new Date().toISOString().slice(0, 7);
  const monthTx     = transactions.filter(t => t.date.startsWith(thisMonth));
  const income      = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense     = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const plannedInc  = budgetPlan.income || income;
  const remaining   = plannedInc - expense;
  const monthlySave = (plannedInc * budgetPlan.ratios.save) / 100;
  const recurringTot = (recurring || []).reduce((s, r) => s + r.amount, 0);
  const byCategory  = CAT
    .map(c => ({ cat: c.label, amount: monthTx.filter(t => t.type === "expense" && t.category === c.id).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.amount > 0);
  return { income, expense, plannedInc, remaining, monthlySave, recurringTot, byCategory };
}

function calcWishlist(data) {
  const { wishlist, budgetPlan } = data;
  const monthlySave = (budgetPlan.income * budgetPlan.ratios.save) / 100;
  return (wishlist || []).map(w => {
    const best = w.offers.length > 0
      ? w.offers.reduce((b, o) => (o.price + (o.shipping || 0)) < (b.price + (b.shipping || 0)) ? o : b)
      : null;
    const price  = best ? best.price + (best.shipping || 0) : w.targetPrice;
    const months = monthlySave > 0 ? Math.ceil(price / monthlySave) : 999;
    return { ...w, bestPrice: price, bestPlatform: best?.platform || "", months };
  }).sort((a, b) => a.months - b.months);
}

function buildContext(data, stats, wishItems) {
  const { income, expense, plannedInc, remaining, monthlySave, recurringTot, byCategory } = stats;
  const { budgetPlan } = data;
  const wishLines = wishItems.map(w =>
    `  - ${w.name}: ฿${w.bestPrice.toLocaleString()} (${w.bestPlatform||"ไม่มีราคา"}) → ต้องออม ${w.months >= 999 ? "ไม่สิ้นสุด" : w.months + " เดือน"}`
  ).join("\n");
  const wishTotal = wishItems.reduce((s, w) => s + w.bestPrice, 0);

  return `ข้อมูลการเงินเดือนนี้:
- รายรับ: ฿${plannedInc.toLocaleString()} (รับจริง ฿${income.toLocaleString()})
- รายจ่าย: ฿${expense.toLocaleString()} | เหลือ: ฿${remaining.toLocaleString()}
- งบ: จำเป็น ${budgetPlan.ratios.need}% / อยากได้ ${budgetPlan.ratios.want}% / ออม ${budgetPlan.ratios.save}%
- ออมต่อเดือน: ฿${monthlySave.toLocaleString()} | รายจ่ายประจำ: ฿${recurringTot.toLocaleString()}
- หมวดค่าใช้จ่าย: ${byCategory.map(c => `${c.cat}฿${c.amount.toLocaleString()}`).join(", ") || "-"}
Wishlist (รวม ฿${wishTotal.toLocaleString()}):
${wishLines || "  - ไม่มีรายการ"}

ช่วยแนะนำวางแผนการใช้เงินที่เหลือ ฿${Math.max(remaining, 0).toLocaleString()} และการออมเพื่อซื้อ Wishlist`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function BudgetDonut({ ratios, income, expense }) {
  const T = useTheme();
  const remaining = Math.max(income - expense, 0);
  const need  = (income * ratios.need) / 100;
  const want  = (income * ratios.want) / 100;
  const save  = (income * ratios.save) / 100;
  const pieData = [
    { name: "จำเป็น",    value: need,  color: T.blue },
    { name: "อยากได้",   value: want,  color: T.purple },
    { name: "ออมทรัพย์", value: save,  color: T.green },
  ].filter(d => d.value > 0);

  const usedPct = income > 0 ? Math.min((expense / income) * 100, 100) : 0;

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>ภาพรวมงบประมาณ</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Donut */}
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatB(v)} contentStyle={{ background: "#1a1a2e", border: "none", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 9, color: T.muted }}>ใช้ไป</div>
            <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700, color: usedPct > 90 ? T.red : T.text }}>
              {Math.round(usedPct)}%
            </div>
          </div>
        </div>

        {/* Legend + stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {pieData.map(d => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T.muted }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 12, color: d.color }}>{formatB(d.value)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, marginTop: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.muted }}>คงเหลือ</span>
              <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700, color: remaining >= 0 ? T.green : T.red }}>{formatB(income - expense)}</span>
            </div>
          </div>
          {/* Usage bar */}
          <div style={{ marginTop: 8, background: T.border, borderRadius: 6, height: 4, overflow: "hidden" }}>
            <div style={{ width: `${usedPct}%`, height: "100%", background: usedPct > 90 ? T.red : T.green, borderRadius: 6, transition: "width .5s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthLabel(months) {
  if (months >= 999) return { text: "ไม่มีข้อมูลราคา", color: T.muted };
  if (months <= 1)   return { text: "ซื้อได้เลย!", color: T.green };
  if (months <= 3)   return { text: `${months} เดือน`, color: T.green };
  if (months <= 6)   return { text: `${months} เดือน`, color: T.accent };
  if (months <= 12)  return { text: `${months} เดือน`, color: "#fb923c" };
  return { text: `${months} เดือน`, color: T.red };
}

function WishlistPlan({ wishItems, monthlySave }) {
  const T = useTheme();
  if (!wishItems.length) return null;
  const maxMonths = Math.min(Math.max(...wishItems.map(w => w.months)), 24);

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShoppingBag size={14} color={T.accent} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>แผนออมซื้อ Wishlist</span>
        </div>
        <div style={{ fontSize: 11, color: T.muted }}>ออม {formatB(monthlySave)}/เดือน</div>
      </div>

      {wishItems.map(w => {
        const label = MonthLabel(w.months);
        const barPct = w.months >= 999 ? 100 : Math.min((w.months / maxMonths) * 100, 100);
        return (
          <div key={w.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{w.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 12, color: T.muted }}>{formatB(w.bestPrice)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: label.color, background: label.color + "22", borderRadius: 6, padding: "1px 7px" }}>
                  {label.text}
                </span>
              </div>
            </div>
            <div style={{ background: T.border, borderRadius: 6, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${barPct}%`, height: "100%", background: label.color, borderRadius: 6, transition: "width .5s" }} />
            </div>
            {w.bestPlatform && (
              <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>ราคาดีสุด: {w.bestPlatform}</div>
            )}
          </div>
        );
      })}

      {/* Cumulative timeline */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={12} color={T.muted} />
        <span style={{ fontSize: 11, color: T.muted }}>
          ซื้อครบทุกชิ้น: <span style={{ color: T.accent, fontWeight: 700 }}>
            {monthlySave > 0
              ? Math.ceil(wishItems.reduce((s, w) => s + (w.months >= 999 ? 0 : w.bestPrice), 0) / monthlySave) + " เดือน"
              : "ยังไม่ได้ตั้งงบออม"}
          </span>
        </span>
      </div>
    </div>
  );
}

function BulletCards({ text, color }) {
  const T = useTheme();
  const bullets = text.split("\n").filter(l => l.trim().startsWith("•")).map(l => l.replace("•", "").trim());
  if (!bullets.length) {
    return (
      <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, fontSize: 13, lineHeight: 1.8, color: T.text, whiteSpace: "pre-wrap" }}>
        {text}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {bullets.map((b, i) => (
        <div key={i} style={{ background: color + "12", border: `1px solid ${color}33`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: T.text, lineHeight: 1.7, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
          <span>{b}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function BudgetAIModal({ onClose, data, model }) {
  const T = useTheme();
  const [role, setRole]     = useState(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const stats     = calcMonthStats(data);
  const wishItems = calcWishlist(data);

  const fetchAdvice = async (r) => {
    setLoading(true);
    setAdvice("");
    try {
      const text = await callOpenRouter(
        [{ role: "user", content: buildContext(data, stats, wishItems) }],
        model, 800, r.system,
      );
      setAdvice(text || "ไม่สามารถวิเคราะห์ได้");
    } catch { setAdvice("เกิดข้อผิดพลาด กรุณาลองใหม่"); }
    setLoading(false);
  };

  const selectRole = (r) => { setRole(r); fetchAdvice(r); };

  return (
    <ModalWrapper title="AI ที่ปรึกษางบประมาณ" onClose={onClose}>

      {/* ── Dashboard Section ── */}
      <BudgetDonut
        ratios={data.budgetPlan.ratios}
        income={data.budgetPlan.income}
        expense={stats.expense}
      />
      <WishlistPlan wishItems={wishItems} monthlySave={stats.monthlySave} />

      {/* ── Role selector (horizontal scroll) ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>เลือก AI ที่ปรึกษา</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => selectRole(r)}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: role?.id === r.id ? r.color + "22" : T.card2, border: `2px solid ${role?.id === r.id ? r.color : T.border}`, borderRadius: 20, padding: "7px 14px", cursor: "pointer", fontFamily: "'Sarabun',sans-serif", transition: "all .15s", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: role?.id === r.id ? r.color : T.muted2 }}>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── AI advice ── */}
      {role && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: role.color, fontWeight: 600 }}>{role.emoji} คำแนะนำจาก {role.name}</div>
            <button onClick={() => fetchAdvice(role)} disabled={loading}
              style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 8px", color: T.muted, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "'Sarabun',sans-serif" }}>
              <RefreshCw size={11} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> ใหม่
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}>
              <Sparkles size={16} /> กำลังคิด...
            </div>
          ) : (
            <BulletCards text={advice} color={role.color} />
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ModalWrapper>
  );
}
