import { useState } from "react";
import { Eye, EyeOff, Check, Trash2, User } from "lucide-react";
import { T } from "../constants/theme";
import ModalWrapper from "../components/ModalWrapper";

export default function ApiKeyModal({ onClose }) {
  const [key, setKey]           = useState(() => localStorage.getItem("finapp_apikey") || "");
  const [ownerName, setOwnerName] = useState(() => localStorage.getItem("finapp_owner") || "");
  const [show, setShow]         = useState(false);
  const [saved, setSaved]       = useState(false);

  const handleSave = () => {
    localStorage.setItem("finapp_apikey", key.trim());
    localStorage.setItem("finapp_owner", ownerName.trim());
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const handleDelete = () => {
    localStorage.removeItem("finapp_apikey");
    setKey("");
    setSaved(false);
  };

  const hasExisting = !!localStorage.getItem("finapp_apikey");
  const canSave = key.trim() || ownerName.trim();

  return (
    <ModalWrapper title="ตั้งค่า" onClose={onClose}>

      {/* Owner name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <User size={12} /> ชื่อเจ้าของบัญชี (ใช้ระบุทิศทางเงินในสลิป)
        </label>
        <input
          type="text"
          value={ownerName}
          onChange={e => { setOwnerName(e.target.value); setSaved(false); }}
          placeholder="เช่น วีรวุฒิ บำรุงสำราญ"
          style={{ width: "100%", background: T.card2, border: `1px solid ${ownerName ? T.accent + "66" : T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 13, fontFamily: "'Sarabun',sans-serif", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 5, lineHeight: 1.6 }}>
          AI จะใช้ชื่อนี้ตรวจสอบว่าสลิปเป็น รายรับ หรือ รายจ่าย
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 20 }} />

      {/* API Key */}
      <div style={{ background: T.card2, borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
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
          style={{ width: "100%", background: T.card2, border: `1px solid ${key ? T.accent + "66" : T.border}`, borderRadius: 12, padding: "12px 44px 12px 16px", color: T.text, fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
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
        disabled={!canSave}
        style={{ width: "100%", background: saved ? T.green : (canSave ? T.accent : T.border), border: "none", borderRadius: 14, padding: 14, color: saved ? "#fff" : (canSave ? "#000" : T.muted), fontWeight: 700, fontSize: 15, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "'Sarabun',sans-serif", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {saved ? <><Check size={16} /> บันทึกแล้ว</> : "บันทึก"}
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
