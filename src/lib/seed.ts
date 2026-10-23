import type { AdCampaign, Lead, LeadStatus, Task } from "@/types";

// Small deterministic random generator so demo data looks the same every time.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const p2 = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const monthsAgo = (m: number, day: number) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  if (m === 0 && d > now) d.setDate(now.getDate());
  return d;
};

const NAMES = [
  "Lim Wei Kiat", "Ahmad Faizal", "Tan Siew Mei", "Rajesh Kumar", "Wong Chee Keong",
  "Nurul Aina", "Lee Kah Hoe", "Mohd Hafiz", "Chong Mei Ling", "Kamal Singh",
  "Ng Boon Huat", "Siti Rohana", "Goh Teck Seng", "Muthu Raman", "Yap Soon Lee",
  "Hasnah Ibrahim", "Teo Kok Wai", "Zulkifli Hassan", "Ong Beng Tatt", "Farah Diyana",
];
const COMPANIES = ["Sdn Bhd", "Engineering", "Enterprise", "Industries", "Trading"];
const MACHINES = [
  "CNC Lathe Machine", "CNC Milling Machine", "Hydraulic Press Brake",
  "Fiber Laser Cutting Machine", "Plasma Cutting Machine", "Injection Moulding Machine",
  "Metal Band Saw", "Surface Grinding Machine",
];
const SALES = ["Jason Tan", "Aisha Rahman", "Kelvin Lim", "Priya Nair"];
const PLATFORMS = ["Facebook", "Facebook", "Facebook", "TikTok", "TikTok", "Google", "WhatsApp", "Website"];

export function seedLeads(): Lead[] {
  const r = rng(11);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const out: Lead[] = [];
  for (let m = 5; m >= 0; m--) {
    const count = 12 + Math.floor(r() * 8);
    for (let i = 0; i < count; i++) {
      const date = monthsAgo(m, 1 + Math.floor(r() * 28));
      if (m === 0 && date > new Date()) continue;
      const roll = r();
      const status: LeadStatus =
        m === 0 && roll < 0.35 ? "New"
        : roll < 0.15 ? "New"
        : roll < 0.35 ? "Contacted"
        : roll < 0.55 ? "Quotation Sent"
        : roll < 0.75 ? "Won"
        : "Lost";
      const name = pick(NAMES);
      out.push({
        id: crypto.randomUUID(),
        customerName: r() < 0.4 ? `${name.split(" ")[0]} ${pick(COMPANIES)}` : name,
        phone: `01${pick(["2", "3", "4", "6", "7", "9"])}-${100 + Math.floor(r() * 900)} ${1000 + Math.floor(r() * 9000)}`,
        date: iso(date),
        platform: pick(PLATFORMS),
        machine: pick(MACHINES),
        salesperson: pick(SALES),
        status,
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function seedAds(): AdCampaign[] {
  const r = rng(29);
  const out: AdCampaign[] = [];
  const plans = [
    { name: "CNC Machine Promo", platform: "Facebook", cpl: 38, roas: 4.2, base: 2800 },
    { name: "Laser Cutter Leads", platform: "Facebook", cpl: 46, roas: 5.1, base: 2200 },
    { name: "Factory Tour Video", platform: "TikTok", cpl: 27, roas: 2.6, base: 1500 },
    { name: "Brand Search", platform: "Google", cpl: 62, roas: 3.4, base: 1200 },
  ];
  for (let m = 5; m >= 0; m--) {
    plans.forEach((p, i) => {
      const spend = Math.round(p.base * (0.8 + r() * 0.5));
      const leads = Math.max(1, Math.round(spend / (p.cpl * (0.85 + r() * 0.3))));
      out.push({
        id: crypto.randomUUID(),
        campaignName: `${p.name} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monthsAgo(m, 1).getMonth()]}`,
        platform: p.platform,
        date: iso(monthsAgo(m, 3 + i * 6)),
        spend,
        leads,
        sales: Math.round(spend * p.roas * (0.7 + r() * 0.6)),
      });
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export function seedTasks(): Task[] {
  const day = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const t = (name: string, assignee: string, due: number, priority: Task["priority"], status: Task["status"]): Task => ({
    id: crypto.randomUUID(), name, assignee, dueDate: day(due), priority, status,
  });
  return [
    t("Design Merdeka Sale poster", "Aisha Rahman", 3, "High", "In Progress"),
    t("Post CNC demo video on TikTok", "Kelvin Lim", 1, "Medium", "To Do"),
    t("Update Facebook Ads budget", "Jason Tan", 2, "High", "To Do"),
    t("Follow up quotation leads", "Priya Nair", 0, "High", "In Progress"),
    t("Update product catalogue PDF", "Aisha Rahman", 10, "Low", "To Do"),
    t("Prepare monthly marketing report", "Jason Tan", 5, "Medium", "To Do"),
    t("Take photos of new laser machine", "Kelvin Lim", -2, "Medium", "Completed"),
    t("Renew Google Business listing", "Priya Nair", -5, "Low", "Completed"),
  ];
}
