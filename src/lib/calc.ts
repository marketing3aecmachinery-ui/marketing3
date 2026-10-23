import type { AdCampaign, Lead } from "@/types";
import { monthKey } from "./format";

const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export interface Summary {
  leads: number;
  won: number;
  spend: number;
  sales: number;
  costPerLead: number;
  conversionRate: number; // % of leads that are Won
  roas: number;
}

/** Leads come from Lead Tracking; spend and sales come from Advertising Performance. */
export function summarize(leads: Lead[], ads: AdCampaign[]): Summary {
  const won = leads.filter((l) => l.status === "Won").length;
  const spend = ads.reduce((s, a) => s + a.spend, 0);
  const sales = ads.reduce((s, a) => s + a.sales, 0);
  return {
    leads: leads.length,
    won,
    spend,
    sales,
    costPerLead: div(spend, leads.length),
    conversionRate: div(won, leads.length) * 100,
    roas: div(sales, spend),
  };
}

export const adCostPerLead = (a: Pick<AdCampaign, "spend" | "leads">) => div(a.spend, a.leads);
export const adRoas = (a: Pick<AdCampaign, "spend" | "sales">) => div(a.sales, a.spend);

export function monthsPresent(leads: Lead[], ads: AdCampaign[]): string[] {
  const set = new Set<string>([...leads.map((l) => monthKey(l.date)), ...ads.map((a) => monthKey(a.date))]);
  return [...set].sort().reverse();
}

export interface MonthRow {
  month: string;
  leads: number;
  spend: number;
  sales: number;
}

export function monthlySeries(leads: Lead[], ads: AdCampaign[], count = 6): MonthRow[] {
  const now = new Date();
  const rows: MonthRow[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    rows.push({
      month,
      leads: leads.filter((l) => monthKey(l.date) === month).length,
      spend: ads.filter((a) => monthKey(a.date) === month).reduce((s, a) => s + a.spend, 0),
      sales: ads.filter((a) => monthKey(a.date) === month).reduce((s, a) => s + a.sales, 0),
    });
  }
  return rows;
}

export interface PlatformRow {
  platform: string;
  leads: number;
  won: number;
  spend: number;
  sales: number;
  costPerLead: number;
  conversionRate: number;
  roas: number;
}

export function byPlatform(leads: Lead[], ads: AdCampaign[]): PlatformRow[] {
  const names = new Set<string>([...leads.map((l) => l.platform), ...ads.map((a) => a.platform)]);
  return [...names]
    .map((platform) => {
      const s = summarize(
        leads.filter((l) => l.platform === platform),
        ads.filter((a) => a.platform === platform),
      );
      return {
        platform,
        leads: s.leads,
        won: s.won,
        spend: s.spend,
        sales: s.sales,
        costPerLead: s.costPerLead,
        conversionRate: s.conversionRate,
        roas: s.roas,
      };
    })
    .sort((a, b) => b.sales - a.sales);
}
