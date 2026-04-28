import { Trash2 } from "lucide-react";
import { CAT } from "../constants/categories";
import { useTheme } from "../contexts/ThemeContext";
import { formatB, thDate } from "../utils/format";

export default function TxRow({ tx, onDelete }) {
  const T = useTheme();
  const cat = CAT.find(c => c.id === tx.category) ?? CAT[CAT.length - 1];
  const Icon = cat.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={cat.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || cat.label}</div>
        <div style={{ fontSize: 11, color: T.muted }}>{thDate(tx.date)} · {cat.label}</div>
      </div>
      <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, fontWeight: 600, color: tx.type === "income" ? T.green : T.red }}>
        {tx.type === "income" ? "+" : "-"}{formatB(tx.amount)}
      </div>
      {onDelete && (
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 4 }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
