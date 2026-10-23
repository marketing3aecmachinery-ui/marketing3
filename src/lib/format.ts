export function rm(n: number): string {
  return (
    "RM " +
    n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

/** 2026-03-05 -> 05/03/2026 */
export function dmy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 2026-03 -> Mar 2026 */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${y}`;
}

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
