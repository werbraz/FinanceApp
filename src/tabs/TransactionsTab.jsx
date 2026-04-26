import { useState } from "react";
import { T } from "../constants/theme";
import TxRow from "../components/TxRow";

export default function TransactionsTab({ data, onDelete }) {
  const [filter, setFilter] = useState("all");
  const { transactions } = data;
  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "expense", "income"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flex: 1, padding: "8px 4px", border: `1px solid ${filter === f ? T.accent : T.border}`, borderRadius: 10, background: filter === f ? T.accentDim : "transparent", color: filter === f ? T.accent : T.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif" }}>
            {f === "all" ? "ทั้งหมด" : f === "expense" ? "รายจ่าย" : "รายรับ"}
          </button>
        ))}
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 16px" }}>
        {filtered.length === 0
          ? <div style={{ padding: 32, textAlign: "center", color: T.muted, fontSize: 14 }}>ไม่มีรายการ</div>
          : filtered.map(tx => <TxRow key={tx.id} tx={tx} onDelete={onDelete} />)
        }
      </div>
    </div>
  );
}
