import { useState } from "react";
import { PlusCircle, Star, Camera, ChevronDown, ChevronUp, Trash2, ExternalLink } from "lucide-react";
import { T } from "../constants/theme";
import { formatB, thDate } from "../utils/format";
import ScanOfferModal from "../modals/ScanOfferModal";

const PLATFORM_COLORS = {
  "Shopee":         "#f97316",
  "TikTok Shop":    "#e879f9",
  "Lazada":         "#60a5fa",
  "Facebook":       "#3b82f6",
  "Line":           "#22c55e",
  "Line Shopping":  "#22c55e",
};

const PLATFORM_LINKS = {
  "Shopee":     "https://shopee.co.th/search?keyword=",
  "TikTok Shop":"https://www.tiktok.com/search?q=",
  "Lazada":     "https://www.lazada.co.th/catalog/?q=",
};

function PlatformPill({ name }) {
  const color = PLATFORM_COLORS[name] ?? T.muted;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, background: color + "22", borderRadius: 6, padding: "2px 7px" }}>
      {name}
    </span>
  );
}

function WishlistCard({ item, onDelete, onScanOffer }) {
  const [open, setOpen] = useState(false);

  const bestOffer = item.offers.length > 0
    ? item.offers.reduce((best, o) => (o.price + (o.shipping || 0)) < (best.price + (best.shipping || 0)) ? o : best)
    : null;

  const bestTotal = bestOffer ? bestOffer.price + (bestOffer.shipping || 0) : null;
  const savingsPct = bestTotal != null
    ? Math.round(((item.targetPrice - bestTotal) / item.targetPrice) * 100)
    : null;

  const platforms = [...new Set(item.offers.map(o => o.platform))];

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      {/* Collapsed row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Star size={18} color={T.accent} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
            เป้าหมาย <span style={{ color: T.accent }}>{formatB(item.targetPrice)}</span>
          </div>

          {/* Best price + savings badge */}
          {bestOffer ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>
                ✓ {formatB(bestTotal)}
              </span>
              {savingsPct > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: T.green + "22", borderRadius: 6, padding: "1px 7px" }}>
                  ลด {savingsPct}%
                </span>
              )}
              {savingsPct < 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: T.red, background: T.red + "22", borderRadius: 6, padding: "1px 7px" }}>
                  แพงกว่า {Math.abs(savingsPct)}%
                </span>
              )}
              {savingsPct === 0 && (
                <span style={{ fontSize: 10, color: T.muted2 }}>ราคาเท่ากัน</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
              📷 กดกล้องเพื่อเพิ่มราคาเปรียบเทียบ
            </div>
          )}

          {/* Platform pills */}
          {platforms.length > 0 && (
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {platforms.map(p => <PlatformPill key={p} name={p} />)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={onScanOffer} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 8px", color: T.muted2, cursor: "pointer" }}>
            <Camera size={14} />
          </button>
          {item.offers.length > 0 && (
            <button onClick={() => setOpen(!open)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 8px", color: T.muted2, cursor: "pointer" }}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button onClick={() => onDelete(item.id)} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 8px", color: T.red, cursor: "pointer" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded: offer breakdown */}
      {open && item.offers.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>เปรียบเทียบราคา {item.offers.length} แหล่ง</div>
          {item.offers
            .slice()
            .sort((a, b) => (a.price + (a.shipping || 0)) - (b.price + (b.shipping || 0)))
            .map((o, i) => {
              const total = o.price + (o.shipping || 0);
              const isBest = bestOffer === o;
              const pColor = PLATFORM_COLORS[o.platform] ?? T.muted2;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: isBest ? T.green + "10" : T.card2, borderRadius: 12, marginBottom: 6, border: `1.5px solid ${isBest ? T.green + "55" : T.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <PlatformPill name={o.platform} />
                      {isBest && <span style={{ fontSize: 10, color: T.green, fontWeight: 700 }}>ถูกสุด</span>}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.shop && `${o.shop} · `}{o.rating && `⭐${o.rating} · `}{thDate(o.capturedAt)}
                    </div>
                    {o.shipping === 0
                      ? <div style={{ fontSize: 10, color: T.green }}>ฟรีค่าส่ง</div>
                      : <div style={{ fontSize: 10, color: T.muted }}>+ส่ง {formatB(o.shipping)}</div>
                    }
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 15, fontWeight: 700, color: isBest ? T.green : T.text }}>
                      {formatB(total)}
                    </div>
                    {o.shipping > 0 && (
                      <div style={{ fontSize: 10, color: T.muted }}>({formatB(o.price)})</div>
                    )}
                  </div>
                  {PLATFORM_LINKS[o.platform] && (
                    <a href={PLATFORM_LINKS[o.platform] + encodeURIComponent(item.name)} target="_blank" rel="noreferrer" style={{ color: T.blue, padding: 4, flexShrink: 0 }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default function WishlistTab({ data, onAdd, onDelete, onAddOffer, model }) {
  const [scanWishId, setScanWishId] = useState(null);

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Wishlist</div>
        <button onClick={onAdd} style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: "6px 12px", color: T.accent, fontSize: 12, cursor: "pointer", fontFamily: "'Sarabun',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
          <PlusCircle size={13} /> เพิ่มของ
        </button>
      </div>

      {data.wishlist.length === 0
        ? <div style={{ textAlign: "center", color: T.muted, padding: 40, fontSize: 14 }}>ยังไม่มีสินค้าใน Wishlist</div>
        : data.wishlist.map(w => (
          <WishlistCard key={w.id} item={w} onDelete={onDelete} onScanOffer={() => setScanWishId(w.id)} />
        ))
      }

      {scanWishId && (
        <ScanOfferModal
          onClose={() => setScanWishId(null)}
          onSave={offer => { onAddOffer(scanWishId, offer); setScanWishId(null); }}
          model={model}
        />
      )}
    </div>
  );
}
