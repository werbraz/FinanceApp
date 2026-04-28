import { useState, useEffect } from "react";
import { PlusCircle, Camera, BarChart2, DollarSign, Target, Star, ChevronDown, KeyRound } from "lucide-react";
import { T } from "./constants/theme";
import { INIT } from "./constants/initialData";
import { today } from "./utils/format";
import { VISION_MODELS, DEFAULT_MODEL } from "./constants/models";
import DashboardTab from "./tabs/DashboardTab";
import TransactionsTab from "./tabs/TransactionsTab";
import BudgetTab from "./tabs/BudgetTab";
import WishlistTab from "./tabs/WishlistTab";
import AddTransactionModal from "./modals/AddTransactionModal";
import ScanModal from "./modals/ScanModal";
import AddWishlistModal from "./modals/AddWishlistModal";
import AIPlanModal from "./modals/AIPlanModal";
import BudgetModal from "./modals/BudgetModal";
import BudgetAIModal from "./modals/BudgetAIModal";
import ModelSelector from "./components/ModelSelector";
import ApiKeyModal from "./modals/ApiKeyModal";

const TABS = [
  { id: "dashboard",    label: "หน้าหลัก", icon: BarChart2 },
  { id: "transactions", label: "รายการ",   icon: DollarSign },
  { id: "budget",       label: "แผนงบ",    icon: Target },
  { id: "wishlist",     label: "Wishlist",  icon: Star },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("finapp_data")) || INIT; }
    catch { return INIT; }
  });
  const [modal, setModal] = useState(null);
  const [model, setModel] = useState(() => localStorage.getItem("finapp_model") || DEFAULT_MODEL);

  useEffect(() => { localStorage.setItem("finapp_data", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("finapp_model", model); }, [model]);

  const addTransaction     = (tx)    => setData(d => ({ ...d, transactions: [{ ...tx, id: Date.now() }, ...d.transactions] }));
  const deleteTransaction  = (id)    => setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) }));
  const addWishlistItem    = (item)  => setData(d => {
    const { initialOffer, ...rest } = item;
    const offers = initialOffer ? [{ ...initialOffer, capturedAt: today() }] : [];
    return { ...d, wishlist: [{ ...rest, id: Date.now(), offers }, ...d.wishlist] };
  });
  const deleteWishlistItem = (id)    => setData(d => ({ ...d, wishlist: d.wishlist.filter(w => w.id !== id) }));
  const updateBudget       = (plan, recurring) => setData(d => ({ ...d, budgetPlan: plan, recurring: recurring ?? d.recurring }));
  const addOfferToWishlist = (wishId, offer) =>
    setData(d => ({
      ...d,
      wishlist: d.wishlist.map(w =>
        w.id === wishId ? { ...w, offers: [...w.offers, { ...offer, capturedAt: today() }] } : w
      ),
    }));

  const currentModel = VISION_MODELS.find(m => m.id === model) ?? VISION_MODELS[0];

  return (
    <>
      {/* Full-screen blurred background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        backgroundImage: "url(/bg01.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        filter: "blur(18px) brightness(0.45) saturate(0.8)",
        transform: "scale(1.08)",
      }} />

    <div style={{ fontFamily: "'Sarabun', sans-serif", background: "transparent", minHeight: "100vh", color: T.text, maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}>

      {/* Header */}
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(12px)", background: "rgba(10,10,18,0.5)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 18, fontWeight: 700, color: T.accent, letterSpacing: 1 }}>FINFLOW</div>
          <div style={{ fontSize: 10, color: T.muted }}>บัญชีรายรับ-รายจ่าย</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* API Key Button */}
          <button
            onClick={() => setModal("apikey")}
            style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="ตั้งค่า API Key"
          >
            <KeyRound size={14} color={localStorage.getItem("finapp_apikey") ? T.accent : T.muted} />
          </button>

          {/* Model Picker Pill */}
          <button
            onClick={() => setModal("model")}
            style={{ display: "flex", alignItems: "center", gap: 4, background: T.card2, border: `1px solid ${currentModel.providerColor}44`, borderRadius: 20, padding: "5px 8px 5px 7px", cursor: "pointer" }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: currentModel.providerColor, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: T.muted2, maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentModel.name}</span>
            <ChevronDown size={10} color={T.muted} />
          </button>

          {/* Scan Button */}
          <button onClick={() => setModal("scan")}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: 10, padding: "7px 12px", fontFamily: "'Sarabun',sans-serif", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
            <Camera size={14} /> สแกน
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "0 0 16px" }}>
        {tab === "dashboard"    && <DashboardTab    data={data} onAdd={() => setModal("add_tx")} onAI={() => setModal("ai_plan")} />}
        {tab === "transactions" && <TransactionsTab data={data} onDelete={deleteTransaction} />}
        {tab === "budget"       && <BudgetTab       data={data} onEdit={() => setModal("budget")} onAI={() => setModal("budget_ai")} />}
        {tab === "wishlist"     && <WishlistTab     data={data} onAdd={() => setModal("wishlist_add")} onDelete={deleteWishlistItem} onAddOffer={addOfferToWishlist} model={model} />}
      </div>

      {/* Bottom Nav with center FAB */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,10,18,0.85)", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "flex-end", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {TABS.slice(0, 2).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "transparent", color: tab === t.id ? T.accent : T.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "color .2s" }}>
            <t.icon size={19} />
            <span style={{ fontSize: 10, fontFamily: "'Sarabun',sans-serif" }}>{t.label}</span>
          </button>
        ))}

        {/* Center raised FAB */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", paddingBottom: 10 }}>
          <button onClick={() => setModal("add_tx")}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: "50%", width: 50, height: 50, cursor: "pointer", boxShadow: `0 4px 20px ${T.accentDim}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -20 }}>
            <PlusCircle size={24} />
          </button>
        </div>

        {TABS.slice(2).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "transparent", color: tab === t.id ? T.accent : T.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "color .2s" }}>
            <t.icon size={19} />
            <span style={{ fontSize: 10, fontFamily: "'Sarabun',sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {modal === "add_tx"       && <AddTransactionModal onClose={() => setModal(null)} onSave={addTransaction} />}
      {modal === "scan"         && <ScanModal           onClose={() => setModal(null)} onSave={addTransaction} model={model} ownerName={localStorage.getItem("finapp_owner") || ""} />}
      {modal === "wishlist_add" && <AddWishlistModal    onClose={() => setModal(null)} onSave={addWishlistItem} model={model} />}
      {modal === "ai_plan"      && <AIPlanModal         onClose={() => setModal(null)} data={data} model={model} />}
      {modal === "budget"       && <BudgetModal         onClose={() => setModal(null)} data={data} onSave={updateBudget} />}
      {modal === "budget_ai"   && <BudgetAIModal      onClose={() => setModal(null)} data={data} model={model} />}
      {modal === "model"        && <ModelSelector       selected={model} onSelect={setModel} onClose={() => setModal(null)} />}
      {modal === "apikey"       && <ApiKeyModal         onClose={() => setModal(null)} />}
    </div>
    </>
  );
}
