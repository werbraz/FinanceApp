import { useState, useRef } from "react";
import { Image, Sparkles, RefreshCw } from "lucide-react";
import { T } from "../constants/theme";
import { callOpenRouter, toImageMsg } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

const SCAN_PROMPT = `ดูภาพสินค้าหรือแคปจอร้านค้าออนไลน์นี้แล้วส่ง JSON เท่านั้น ห้ามอธิบาย:
{"name":"","targetPrice":0,"platform":"","shop":"","price":0,"shipping":0,"rating":""}
- name: ชื่อสินค้า รุ่น (ภาษาไทยหรืออังกฤษตามในภาพ)
- targetPrice: ราคาที่เห็นในภาพ (ตัวเลข ถ้าเห็นหลายราคาให้ใช้ราคาขาย)
- platform: ระบุ platform ให้ตรงที่สุด เช่น Shopee / TikTok Shop / Lazada / Facebook / Line Shopping / อื่นๆ
  * ถ้าเห็นโลโก้สีเขียวหรือ LINE ให้ส่ง "Line Shopping"
  * ถ้าไม่ใช่หน้าร้านค้าให้ส่ง ""
- shop: ชื่อร้านค้าหรือแบรนด์ (ถ้าไม่มีให้ส่ง "")
- price: ราคาสินค้าในภาพ (ตัวเลขเท่านั้น ถ้าหาไม่เจอให้ใส่ค่าเดียวกับ targetPrice)
- shipping: ค่าจัดส่ง (0 ถ้าฟรีหรือไม่ระบุ)
- rating: คะแนนร้านหรือสินค้า (ถ้าไม่มีให้ส่ง "")
ถ้าอ่านไม่ได้เลยส่ง {"error":"อ่านไม่ได้"}`;

export default function AddWishlistModal({ onClose, onSave, model }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [detectedOffer, setDetectedOffer] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      setPreview(e.target.result);
      setScanning(true);
      setDetectedOffer(null);
      try {
        const text = await callOpenRouter([toImageMsg(base64, file.type, SCAN_PROMPT)], model, 400);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (!parsed.error) {
          if (parsed.name) setName(parsed.name);
          const p = parsed.price > 0 ? parsed.price : parsed.targetPrice;
          if (p > 0) setTarget(String(p));
          if (parsed.platform) {
            setDetectedOffer({
              platform: parsed.platform,
              shop: parsed.shop || "",
              price: parsed.price || parsed.targetPrice || 0,
              shipping: parsed.shipping || 0,
              rating: parsed.rating || "",
            });
          }
        }
      } catch {}
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const canSave = name.trim() && target;

  const handleSave = () => {
    if (!canSave) return;
    const tPrice = parseFloat(target);
    const item = { name: name.trim(), targetPrice: tPrice };
    if (detectedOffer?.platform) {
      // fallback to targetPrice if AI couldn't read price from image
      const offerPrice = detectedOffer.price > 0 ? detectedOffer.price : tPrice;
      item.initialOffer = { ...detectedOffer, price: offerPrice };
    }
    onSave(item);
    onClose();
  };

  return (
    <ModalWrapper title="เพิ่มสิ่งที่อยากได้" onClose={onClose}>

      {/* Image scan zone */}
      <div
        onClick={() => !scanning && fileRef.current?.click()}
        style={{ border: `2px dashed ${scanning ? T.accent : T.border}`, borderRadius: 14, marginBottom: 16, overflow: "hidden", position: "relative", cursor: scanning ? "default" : "pointer", background: T.card2, minHeight: preview ? 0 : 90, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {preview ? (
          <>
            <img src={preview} alt="" style={{ width: "100%", maxHeight: 150, objectFit: "contain", display: "block" }} />
            {scanning && (
              <div style={{ position: "absolute", inset: 0, background: "#00000099", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={22} color={T.accent} />
                <span style={{ fontSize: 13, color: T.accent }}>AI กำลังอ่านภาพ...</span>
              </div>
            )}
            {!scanning && (
              <div style={{ position: "absolute", bottom: 8, right: 8, background: "#00000088", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#fff" }}>
                <RefreshCw size={11} /> เปลี่ยนรูป
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "18px 16px" }}>
            <Image size={28} color={T.muted} style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ fontSize: 13, color: T.muted2 }}>
              แตะเพื่อ <strong style={{ color: T.accent }}>สแกนภาพสินค้า</strong>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>
              รองรับภาพจาก Shopee · TikTok · Lazada · Facebook · Line
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])} />

      {/* Detected offer badge */}
      {detectedOffer?.platform && (
        <div style={{ background: T.green + "15", border: `1px solid ${T.green}44`, borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ color: T.green }}>✓</span>
          <span style={{ color: T.muted2 }}>พบร้านค้า:</span>
          <span style={{ fontWeight: 600, color: T.text }}>{detectedOffer.platform}</span>
          {detectedOffer.shop && <span style={{ color: T.muted }}>· {detectedOffer.shop}</span>}
          {detectedOffer.rating && <span style={{ color: T.muted }}>· ⭐{detectedOffer.rating}</span>}
          <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>บันทึกเป็น offer อัตโนมัติ</span>
        </div>
      )}

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>ชื่อสินค้า</label>
      <input
        value={name} onChange={e => setName(e.target.value)} placeholder="เช่น หูฟัง Sony..."
        style={{ width: "100%", background: T.card2, border: `1px solid ${name ? T.accent + "66" : T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, fontFamily: "'Sarabun',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 16, transition: "border-color .2s" }}
      />

      <label style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>ราคาเป้าหมาย (บาท)</label>
      <input
        type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0"
        style={{ width: "100%", background: T.card2, border: `1px solid ${target ? T.accent + "66" : T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, fontFamily: "'Chakra Petch',sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 20, transition: "border-color .2s" }}
      />

      <button
        onClick={handleSave} disabled={!canSave}
        style={{ width: "100%", background: canSave ? T.accent : T.border, border: "none", borderRadius: 14, padding: 14, color: canSave ? "#000" : T.muted, fontWeight: 700, fontSize: 15, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "'Sarabun',sans-serif", transition: "background .2s" }}>
        เพิ่ม Wishlist
      </button>
    </ModalWrapper>
  );
}
