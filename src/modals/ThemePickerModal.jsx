import { Check } from "lucide-react";
import { THEMES } from "../constants/themes";
import { useTheme } from "../contexts/ThemeContext";
import ModalWrapper from "../components/ModalWrapper";

function ThemeCard({ theme, selected, onSelect }) {
  const T = useTheme();
  const active = selected === theme.id;
  return (
    <button onClick={() => onSelect(theme.id)}
      style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: active ? theme.accent + "18" : T.card2, border: `2px solid ${active ? theme.accent : T.border}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left", marginBottom: 10, transition: "all .15s", fontFamily: "'Sarabun',sans-serif" }}>

      {/* Color swatches */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {[theme.accent, theme.green, theme.purple, theme.card].map((c, i) => (
          <div key={i} style={{ width: 14, height: 36, borderRadius: 6, background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: active ? theme.accent : T.text }}>
          {theme.emoji} {theme.name}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[theme.accent, theme.green, theme.red, theme.blue, theme.purple].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>

      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${active ? theme.accent : T.border}`, background: active ? theme.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {active && <Check size={13} color="#000" strokeWidth={3} />}
      </div>
    </button>
  );
}

export default function ThemePickerModal({ onClose }) {
  const { themeId, setTheme } = useTheme();

  return (
    <ModalWrapper title="🎨 เลือก Theme" onClose={onClose}>
      <div style={{ marginBottom: 8, fontSize: 12, color: "#6b6880" }}>
        เลือก theme ที่ชอบ — บันทึกอัตโนมัติ
      </div>
      {Object.values(THEMES).map(theme => (
        <ThemeCard key={theme.id} theme={theme} selected={themeId}
          onSelect={(id) => { setTheme(id); onClose(); }} />
      ))}
    </ModalWrapper>
  );
}
