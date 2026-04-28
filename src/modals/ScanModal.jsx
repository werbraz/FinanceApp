import { useState, useRef } from "react";
import { Camera, Sparkles, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { CAT } from "../constants/categories";
import { T } from "../constants/theme";
import { today, formatB } from "../utils/format";
import { callOpenRouter, toImageMsg } from "../utils/openrouter";
import ModalWrapper from "../components/ModalWrapper";

function buildPrompt(ownerName) {
  const nameRule = ownerName
    ? `ชื่อเจ้าของแอปคือ "${ownerName}"
- ถ้าเป็นสลิปโอนเงิน และ "${ownerName}" อยู่ในช่อง "ถึง/ผู้รับ" → type = "income"
- ถ้าเป็นสลิปโอนเงิน และ "${ownerName}" อยู่ในช่อง "จาก/ผู้โอน" → type = "expense"
- ถ้าเป็นใบเสร็จ/บิลซื้อของ → type = "expense"
- ถ้าไม่แน่ใจ → type = "expense"`
    : `- type: "income" ถ้าเป็นเงินรับเข้า, "expense" ถ้าเป็นเงินออก/ใบเสร็จ/บิล`;

  return `วิเคราะห์รูปนี้ว่าเป็นสลิปโอนเงินหรือใบเสร็จ แล้วแตกข้อมูลออกมาเป็น JSON เท่านั้น ไม่ต้องอธิบายเพิ่มเติม รูปแบบ:
{"type":"expense","amount":0,"note":"","category":"food","items":[{"name":"","price":0}]}
${nameRule}
- amount: ยอดรวมทั้งหมด (ตัวเลขเท่านั้น ไม่ติดลบ)
- note: ชื่อร้าน หรือชื่อผู้โอน/ผู้รับ
- category: food/travel/home/shop/health/entertain/phone/other
- items: รายการสินค้า (ถ้ามี) ถ้าไม่มีให้ส่ง []
ถ้าอ่านไม่ได้ให้ส่ง {"error":"อ่านไม่ได้"}`;
}

export default function ScanModal({ onClose, onSave, model, ownerName = "" }) {
  const [step, setStep]       = useState("upload");
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [userType, setUserType] = useState(null); // "income" | "expense" | null (null = use AI result)
  const [error, setError]     = useState("");
  const fileRef               = useRef();

  const effectiveType = userType ?? result?.type ?? "expense";
  const isIncome      = effectiveType === "income";

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      setPreview(e.target.result);
      setStep("scanning");
      setError("");
      setUserType(null);
      try {
        const prompt = buildPrompt(ownerName);
        const text = await callOpenRouter([toImageMsg(base64, file.type, prompt)], model, 1000);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (parsed.error) { setError("อ่านภาพไม่ได้ กรุณาลองใหม่"); setStep("upload"); }
        else { setResult({ ...parsed, date: today() }); setStep("preview"); }
      } catch {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        setStep("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const confirm = () => {
    if (result) {
      onSave({ ...result, type: effectiveType, source: "scan" });
      onClose();
    }
  };

  const resetUpload = () => { setStep("upload"); setUserType(null); };

  return (
    <ModalWrapper title="สแกนสลิป / บิล" onClose={onClose}>
      {step === "upload" && (
        <div>
          {error && (
            <div style={{ background: T.red + "22", border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", color: T.red, fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}
          {!ownerName && (
            <div style={{ background: T.accent + "15", border: `1px solid ${T.accent}44`, borderRadius: 10, padding: "10px 14px", color: T.accent, fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
              ตั้งชื่อเจ้าของบัญชีในหน้าตั้งค่า เพื่อให้ AI แยกรายรับ-รายจ่ายได้แม่นยำขึ้น
            </div>
          )}
          <div onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${T.border}`, borderRadius: 16, padding: 40, textAlign: "center", cursor: "pointer", background: T.card2 }}>
            <Camera size={40} color={T.muted} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontSize: 14, color: T.muted2, marginBottom: 6 }}>แตะเพื่อถ่ายรูป / เลือกรูป</div>
            <div style={{ fontSize: 12, color: T.muted }}>สลิปโอนเงิน หรือใบเสร็จ</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {step === "scanning" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {preview && <img src={preview} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 12, marginBottom: 20 }} />}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 12, padding: "12px 20px" }}>
            <Sparkles size={18} color={T.accent} />
            <span style={{ fontSize: 14, color: T.accent }}>AI กำลังอ่านบิล...</span>
          </div>
        </div>
      )}

      {step === "preview" && result && (
        <div>
          {preview && <img src={preview} alt="" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 12, marginBottom: 14 }} />}

          {/* Income / Expense toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => setUserType("income")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, border: `2px solid ${isIncome ? T.green : T.border}`, background: isIncome ? T.green + "22" : T.card2, color: isIncome ? T.green : T.muted, fontWeight: isIncome ? 700 : 400, fontFamily: "'Sarabun',sans-serif", fontSize: 14, cursor: "pointer", transition: "all .15s" }}
            >
              <TrendingUp size={15} /> รายรับ
            </button>
            <button
              onClick={() => setUserType("expense")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, border: `2px solid ${!isIncome ? T.red : T.border}`, background: !isIncome ? T.red + "22" : T.card2, color: !isIncome ? T.red : T.muted, fontWeight: !isIncome ? 700 : 400, fontFamily: "'Sarabun',sans-serif", fontSize: 14, cursor: "pointer", transition: "all .15s" }}
            >
              <TrendingDown size={15} /> รายจ่าย
            </button>
          </div>

          {/* Result card */}
          <div style={{ background: T.card2, border: `1px solid ${isIncome ? T.green + "44" : T.red + "44"}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <CheckCircle size={16} color={T.green} />
              <span style={{ fontSize: 13, color: T.green }}>AI อ่านสำเร็จ — โปรดตรวจสอบ</span>
              {userType && (
                <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted }}>แก้ไขเอง</span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.muted }}>ยอดเงิน</span>
              <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 18, fontWeight: 700, color: isIncome ? T.green : T.red }}>
                {isIncome ? "+" : "-"}{formatB(result.amount)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.muted }}>บันทึก</span>
              <span style={{ fontSize: 13 }}>{result.note}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: T.muted }}>หมวด</span>
              <span style={{ fontSize: 13 }}>{CAT.find(c => c.id === result.category)?.label ?? result.category}</span>
            </div>
            {result.items?.length > 0 && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>รายการสินค้า</div>
                {result.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
                    <span>{it.name}</span><span>{formatB(it.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={resetUpload} style={{ flex: 1, background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, color: T.muted, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", fontSize: 13 }}>สแกนใหม่</button>
            <button onClick={confirm} style={{ flex: 2, background: T.accent, border: "none", borderRadius: 12, padding: 12, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", fontSize: 14 }}>ยืนยันบันทึก</button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
