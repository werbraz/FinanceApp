import {
  ShoppingCart, Home, Car, Heart, Utensils,
  Smartphone, Music, Plane, Gift, BookOpen, Package,
} from "lucide-react";

export const CAT = [
  { id: "food",      label: "อาหาร",        icon: Utensils,     color: "#f59e0b" },
  { id: "travel",    label: "เดินทาง",       icon: Car,          color: "#60a5fa" },
  { id: "home",      label: "ที่พัก/บ้าน",  icon: Home,         color: "#34d399" },
  { id: "shop",      label: "ช้อปปิ้ง",      icon: ShoppingCart, color: "#f472b6" },
  { id: "health",    label: "สุขภาพ",        icon: Heart,        color: "#f87171" },
  { id: "entertain", label: "บันเทิง",       icon: Music,        color: "#a78bfa" },
  { id: "phone",     label: "โทรศัพท์/net",  icon: Smartphone,   color: "#38bdf8" },
  { id: "travel2",   label: "ท่องเที่ยว",    icon: Plane,        color: "#fb923c" },
  { id: "gift",      label: "ของขวัญ",       icon: Gift,         color: "#e879f9" },
  { id: "education", label: "การศึกษา",      icon: BookOpen,     color: "#4ade80" },
  { id: "other",     label: "อื่นๆ",         icon: Package,      color: "#94a3b8" },
];

export const PLATFORMS = ["Shopee", "TikTok Shop", "Facebook", "Lazada", "อื่นๆ"];
export const PIE_COLORS = CAT.map(c => c.color);
