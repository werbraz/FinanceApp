import { useState, useRef } from "react";
import { Image, Sparkles } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { formatB } from "../utils/format";
import { callOpenRouter, toImageMsg } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

const SCAN_PROMPT = `อ่านภาพแคปหน้าจอร้านค้าออนไลน์นี้ แล้วส่ง JSON เท่านั้น:
{"platform":"Shopee","price":0,"shipping":0,"shop":"","rating":""}
- platform: Shopee / TikTok Shop / Lazada / Facebook / อื่นๆ
- price: ราคาสินค้า (ตัวเลข)
- shipping: ค่าส่ง (0 ถ้าฟรี)
- shop: ชื่อร้าน
- rating: คะแนนร้าน
ถ้าอ่านไม่ได้ส่ง {"error":"อ่านไม่ได้"}`;

export default function ScanOfferModal({ onClose, onSave, model }) {
  const T = useTheme();
  const [step, setStep] = useState("upload");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      setPreview(e.target.result);
      setStep("scanning");
      try {
        const text = await callOpenRouter([toImageMsg(base64, file.type, SCAN_PROMPT)], model, 600);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (parsed.error) setStep("upload");
        else { setResult(parsed); setStep("preview"); }
      } catch { setStep("upload"); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <ModalWrapper title="แคปจอราคาสินค้า" onClose={onClose}>
      {step === "upload" && (
        <div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>แคปจอหน้าสินค้าจาก Shopee / TikTok / Facebook แล้วอัปโหลด AI จะอ่านราคาให้อัตโนมัติ</div>
          <div onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${T.border}`, borderRadius: 16, padding: 40, textAlign: "center", cursor: "pointer", background: T.card2 }}>
            <Image size={36} color={T.muted} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontSize: 14, color: T.muted2 }}>เลือกภาพแคปจอ</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {step === "scanning" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {preview && <img src={preview} alt="" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 12, marginBottom: 16 }} />}
          <div style={{ color: T.accent, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Sparkles size={18} />AI กำลังอ่านราคา...
          </div>
        </div>
      )}

      {step === "preview" && result && (
        <div>
          {preview && <img src={preview} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 12, marginBottom: 16 }} />}
          <div style={{ background: T.card2, border: `1px solid ${T.green}44`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Platform", result.platform],
                ["ร้าน", result.shop],
                ["ราคา", formatB(result.price)],
                ["ค่าส่ง", result.shipping === 0 ? "ฟรี" : formatB(result.shipping)],
                ["Rating", result.rating ? `⭐${result.rating}` : "-"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: T.muted }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep("upload")} style={{ flex: 1, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, color: T.muted, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", fontSize: 13 }}>ใหม่</button>
            <button onClick={() => onSave(result)} style={{ flex: 2, background: T.accent, border: "none", borderRadius: 12, padding: 12, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", fontSize: 14 }}>บันทึกราคา</button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
