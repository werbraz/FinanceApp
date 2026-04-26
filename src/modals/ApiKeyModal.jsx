import { useState } from "react";
import { Eye, EyeOff, Check, Trash2 } from "lucide-react";
import { T } from "../constants/theme";
import ModalWrapper from "../components/ModalWrapper";

export default function ApiKeyModal({ onClose }) {
  const [key, setKey] = useState(() => localStorage.getItem("finapp_apikey") || "");
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("finapp_apikey", key.trim());
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const handleDelete = () => {
    localStorage.removeItem("finapp_apikey");
    setKey("");
    setSaved(false);
  };

  const hasExisting = !!localStorage.getItem("finapp_apikey");

  return (
    <ModalWrapper title="OpenRouter API Key" onClose={onClose}>

      <div style={{ background: T.card2, borderRadius: 12, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
        รับ API key ได้ที่{" "}
        <span style={{ color: T.accent, fontWeight: 600 }}>openrouter.ai/keys</span>
        <br />
        key จะบันทึกในเครื่องนี้เท่านั้น ไม่ส่งออกไปที่อื่น
      </div>

      {hasExisting && !key && (
        <div style={{ background: T.green + "15", border: `1px solid ${T.green}44`, borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 12, color: T.green, display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={13} /> มี API Key บันทึกอยู่แล้ว
        </div>
      )}

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>API Key</label>
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          type={show ? "text" : "password"}
          value={key}
          onChange={e => { setKey(e.target.value); setSaved(false); }}
          placeholder="sk-or-v1-..."
          style={{ width: "100%", background: T.card2, border: `1px solid ${key ? T.accent + "66" : T.border}`, borderRadius: 12, padding: "12px 44px 12px 16px", color: T.text, fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box", transition: "border-color .2s" }}
        />
        <button
          onClick={() => setShow(!show)}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 4 }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!key.trim()}
        style={{ width: "100%", background: saved ? T.green : (key.trim() ? T.accent : T.border), border: "none", borderRadius: 14, padding: 14, color: saved ? "#fff" : (key.trim() ? "#000" : T.muted), fontWeight: 700, fontSize: 15, cursor: key.trim() ? "pointer" : "not-allowed", fontFamily: "'Sarabun',sans-serif", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {saved ? <><Check size={16} /> บันทึกแล้ว</> : "บันทึก API Key"}
      </button>

      {(key || hasExisting) && (
        <button
          onClick={handleDelete}
          style={{ width: "100%", background: "none", border: `1px solid ${T.red}44`, borderRadius: 14, padding: "10px 14px", color: T.red, fontSize: 13, cursor: "pointer", marginTop: 10, fontFamily: "'Sarabun',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Trash2 size={14} /> ลบ API Key
        </button>
      )}
    </ModalWrapper>
  );
}
