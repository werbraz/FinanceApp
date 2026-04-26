import { X } from "lucide-react";
import { T } from "../constants/theme";

export default function ModalWrapper({ title, onClose, children }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "92vh", overflow: "auto", padding: "0 0 40px" }}>
        <div style={{ position: "sticky", top: 0, background: T.card, padding: "16px 20px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: T.card2, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "16px 20px 0" }}>{children}</div>
      </div>
    </div>
  );
}
