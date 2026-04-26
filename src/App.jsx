import { useState, useEffect } from "react";
import { PlusCircle, Camera, BarChart2, DollarSign, Target, Star, ChevronDown } from "lucide-react";
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
import ModelSelector from "./components/ModelSelector";

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
  const updateBudget       = (plan)  => setData(d => ({ ...d, budgetPlan: plan }));
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

    <div style={{ fontFamily: "'Sarabun', sans-serif", background: "transparent", minHeight: "100vh", color: T.text, maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, backdropFilter: "blur(12px)", background: "rgba(10,10,18,0.5)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 20, fontWeight: 700, color: T.accent, letterSpacing: 1 }}>FINFLOW</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>บัญชีรายรับ-รายจ่าย</div>
        </div>

        {/* Model Picker Pill */}
        <button
          onClick={() => setModal("model")}
          style={{ display: "flex", alignItems: "center", gap: 5, background: T.card2, border: `1px solid ${currentModel.providerColor}44`, borderRadius: 20, padding: "5px 10px 5px 8px", cursor: "pointer", flexShrink: 0 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: currentModel.providerColor, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: T.muted2, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentModel.name}</span>
          <ChevronDown size={11} color={T.muted} />
        </button>

        <button onClick={() => setModal("scan")}
          style={{ background: T.accent, color: "#000", border: "none", borderRadius: 12, padding: "8px 14px", fontFamily: "'Sarabun',sans-serif", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
          <Camera size={15} /> สแกนบิล
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "0 0 16px" }}>
        {tab === "dashboard"    && <DashboardTab    data={data} onAdd={() => setModal("add_tx")} onAI={() => setModal("ai_plan")} />}
        {tab === "transactions" && <TransactionsTab data={data} onDelete={deleteTransaction} />}
        {tab === "budget"       && <BudgetTab       data={data} onEdit={() => setModal("budget")} />}
        {tab === "wishlist"     && <WishlistTab     data={data} onAdd={() => setModal("wishlist_add")} onDelete={deleteWishlistItem} onAddOffer={addOfferToWishlist} model={model} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,10,18,0.75)", backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "12px 4px 16px", border: "none", background: "transparent", color: tab === t.id ? T.accent : T.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "color .2s" }}>
            <t.icon size={20} />
            <span style={{ fontSize: 10, fontFamily: "'Sarabun',sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setModal("add_tx")}
        style={{ position: "fixed", bottom: 72, right: "calc(50% - 215px + 16px)", background: T.accent, color: "#000", border: "none", borderRadius: "50%", width: 52, height: 52, cursor: "pointer", boxShadow: `0 4px 20px ${T.accentDim}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
        <PlusCircle size={26} />
      </button>

      {/* Modals */}
      {modal === "add_tx"       && <AddTransactionModal onClose={() => setModal(null)} onSave={addTransaction} />}
      {modal === "scan"         && <ScanModal           onClose={() => setModal(null)} onSave={addTransaction} model={model} />}
      {modal === "wishlist_add" && <AddWishlistModal    onClose={() => setModal(null)} onSave={addWishlistItem} model={model} />}
      {modal === "ai_plan"      && <AIPlanModal         onClose={() => setModal(null)} data={data} model={model} />}
      {modal === "budget"       && <BudgetModal         onClose={() => setModal(null)} data={data} onSave={updateBudget} />}
      {modal === "model"        && <ModelSelector       selected={model} onSelect={setModel} onClose={() => setModal(null)} />}
    </div>
    </>
  );
}
