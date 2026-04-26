import { X, Check, Cpu } from "lucide-react";
import { T } from "../constants/theme";
import { VISION_MODELS } from "../constants/models";

function ModelCard({ m, selected, onSelect }) {
  const isSelected = selected === m.id;
  return (
    <button
      onClick={() => onSelect(m.id)}
      style={{
        width: "100%", textAlign: "left", background: isSelected ? m.providerColor + "18" : T.card2,
        border: `1.5px solid ${isSelected ? m.providerColor : T.border}`,
        borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, transition: "border-color .15s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{m.name}</span>
          <span style={{ fontSize: 10, color: m.providerColor, background: m.providerColor + "22", borderRadius: 6, padding: "1px 7px", fontWeight: 600 }}>
            {m.provider}
          </span>
          {m.badge && (
            <span style={{ fontSize: 10, color: m.badgeColor, background: m.badgeColor + "22", borderRadius: 6, padding: "1px 7px", fontWeight: 700 }}>
              {m.badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.4 }}>{m.desc}</div>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isSelected ? m.providerColor : T.border}`, background: isSelected ? m.providerColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
      </div>
    </button>
  );
}

export default function ModelSelector({ selected, onSelect, onClose }) {
  const current = VISION_MODELS.find(m => m.id === selected);
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "88vh", overflow: "auto", padding: "0 0 40px" }}>
        <div style={{ position: "sticky", top: 0, background: T.card, padding: "16px 20px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={16} color={T.accent} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>เลือก AI Model</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>ใช้กับ OCR สแกนบิล และวิเคราะห์รูปภาพ</div>
          </div>
          <button onClick={onClose} style={{ background: T.card2, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          {/* Vision capability note */}
          <div style={{ background: T.accentDim, border: `1px solid ${T.accent}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: T.muted2 }}>
            ✦ ทุกโมเดลในรายการรองรับ <strong style={{ color: T.accent }}>Vision / OCR</strong> — อ่านรูปภาพ สลิป ใบเสร็จ แคปจอได้
          </div>

          {VISION_MODELS.map(m => (
            <ModelCard key={m.id} m={m} selected={selected} onSelect={(id) => { onSelect(id); onClose(); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
