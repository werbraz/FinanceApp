export function formatB(n) {
  return "฿" + Number(n).toLocaleString("th-TH", { minimumFractionDigits: 0 });
}

export function today() {
  return new Date().toISOString().split("T")[0];
}

export function thDate(d) {
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
