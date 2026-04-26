const todayStr = new Date().toISOString().split("T")[0];

export const INIT = {
  transactions: [
    { id: 1, type: "expense", amount: 120,   category: "food",     note: "ข้าวกลางวัน", date: todayStr, source: "manual" },
    { id: 2, type: "expense", amount: 350,   category: "travel",   note: "น้ำมัน",       date: todayStr, source: "manual" },
    { id: 3, type: "income",  amount: 25000, category: "other",    note: "เงินเดือน",    date: todayStr, source: "manual" },
    { id: 4, type: "expense", amount: 599,   category: "shop",     note: "เสื้อผ้า",     date: todayStr, source: "manual" },
    { id: 5, type: "expense", amount: 85,    category: "entertain",note: "Netflix",       date: todayStr, source: "manual" },
  ],
  budgetPlan: { income: 25000, ratios: { need: 50, want: 30, save: 20 } },
  wishlist: [
    {
      id: 1, name: "หูฟัง Sony WH-1000XM5", targetPrice: 8000,
      offers: [
        { platform: "Shopee",     price: 8990, shipping: 30, shop: "SonyThailand", rating: "4.9", capturedAt: todayStr },
        { platform: "TikTok Shop",price: 8500, shipping: 0,  shop: "SonyTH",       rating: "4.7", capturedAt: todayStr },
      ],
    },
  ],
  recurring: [
    { id: 1, label: "Netflix", amount: 299, dueDay: 5,  category: "entertain" },
    { id: 2, label: "ค่าไฟ",  amount: 800, dueDay: 15, category: "home" },
  ],
};
