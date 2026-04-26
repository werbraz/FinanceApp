import { Sparkles, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CAT } from "../constants/categories";
import { T } from "../constants/theme";
import { formatB, today } from "../utils/format";
import TxRow from "../components/TxRow";

export default function DashboardTab({ data, onAdd, onAI }) {
  const { transactions } = data;
  const thisMonth = new Date().toISOString().slice(0, 7);

  const monthTx = transactions.filter(t => t.date.startsWith(thisMonth));
  const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const catData = CAT.map(c => ({
    name: c.label,
    value: monthTx.filter(t => t.type === "expense" && t.category === c.id).reduce((s, t) => s + t.amount, 0),
    color: c.color,
  })).filter(c => c.value > 0);

  const todayExp = transactions
    .filter(t => t.date === today() && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: "20px 16px 0" }}>
      {/* Balance Card */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", border: `1px solid ${T.border}`, borderRadius: 20, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: T.accentDim }} />
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>ยอดคงเหลือเดือนนี้</div>
        <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 32, fontWeight: 700, color: balance >= 0 ? T.green : T.red }}>
          {formatB(balance)}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted }}>รายรับ</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.green }}>+{formatB(income)}</div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div>
            <div style={{ fontSize: 11, color: T.muted }}>รายจ่าย</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.red }}>-{formatB(expense)}</div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div>
            <div style={{ fontSize: 11, color: T.muted }}>วันนี้</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.accent }}>-{formatB(todayExp)}</div>
          </div>
        </div>
      </div>

      {/* AI Plan Button */}
      <button onClick={onAI} style={{ width: "100%", background: "linear-gradient(90deg, #f0c04015, #a78bfa15)", border: "1px solid #a78bfa44", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16, textAlign: "left" }}>
        <div style={{ background: "#a78bfa22", borderRadius: 10, padding: 8 }}>
          <Sparkles size={18} color="#a78bfa" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>AI วิเคราะห์รายจ่าย</div>
          <div style={{ fontSize: 12, color: T.muted }}>วางแผนลดรายจ่ายเดือนถัดไป</div>
        </div>
        <ChevronRight size={16} color={T.muted} style={{ marginLeft: "auto" }} />
      </button>

      {/* Pie Chart */}
      {catData.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>รายจ่ายแยกหมวด</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {catData.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: T.muted2, flex: 1 }}>{c.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{formatB(c.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span>รายการล่าสุด</span>
          <span style={{ fontSize: 12, color: T.accent, cursor: "pointer" }}>ดูทั้งหมด</span>
        </div>
        {transactions.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}
