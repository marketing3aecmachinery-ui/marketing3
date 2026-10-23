"use client";

import { useMemo, useState } from "react";
import { useData } from "@/data/DataProvider";
import { byPlatform, monthsPresent, summarize } from "@/lib/calc";
import { downloadCsv } from "@/lib/csv";
import { monthKey, monthLabel, pct, rm, todayISO } from "@/lib/format";
import { Button, Card, EmptyState, PageHeader, inputCls, td, th } from "@/components/ui";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900">{value}</div>
    </Card>
  );
}

export default function ReportPage() {
  const { leads, ads } = useData();
  const months = useMemo(() => monthsPresent(leads.items, ads.items), [leads.items, ads.items]);
  const [picked, setPicked] = useState("");
  const month = picked && months.includes(picked) ? picked : (months[0] ?? monthKey(todayISO()));

  const mLeads = useMemo(() => leads.items.filter((l) => monthKey(l.date) === month), [leads.items, month]);
  const mAds = useMemo(() => ads.items.filter((a) => monthKey(a.date) === month), [ads.items, month]);
  const s = useMemo(() => summarize(mLeads, mAds), [mLeads, mAds]);
  const platforms = useMemo(() => byPlatform(mLeads, mAds), [mLeads, mAds]);

  const exportCsv = () =>
    downloadCsv(`AEC-marketing-report-${month}.csv`, [
      ["AEC Machinery (M) Sdn Bhd - Monthly Marketing Report"],
      ["Month", monthLabel(month)],
      [],
      ["Summary"],
      ["Advertising Spending (RM)", s.spend.toFixed(2)],
      ["Leads", s.leads],
      ["Leads Won", s.won],
      ["Sales (RM)", s.sales.toFixed(2)],
      ["Lead Conversion Rate (%)", s.conversionRate.toFixed(1)],
      ["Cost Per Lead (RM)", s.costPerLead.toFixed(2)],
      ["ROAS", s.roas.toFixed(2)],
      [],
      ["Performance by Platform"],
      ["Platform", "Leads", "Won", "Spend (RM)", "Sales (RM)", "Cost Per Lead (RM)", "Conversion (%)", "ROAS"],
      ...platforms.map((p) => [p.platform, p.leads, p.won, p.spend.toFixed(2), p.sales.toFixed(2), p.costPerLead.toFixed(2), p.conversionRate.toFixed(1), p.roas.toFixed(2)]),
    ]);

  return (
    <>
      <PageHeader
        title="Monthly Report"
        subtitle="Leads come from Lead Tracking; spend and sales from Advertising Performance"
        actions={
          <>
            <select className={`${inputCls} !w-auto`} value={month} onChange={(e) => setPicked(e.target.value)} aria-label="Select month">
              {(months.length ? months : [month]).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <Button onClick={exportCsv}>Export CSV</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Advertising Spending" value={rm(s.spend)} />
        <Kpi label="Leads" value={String(s.leads)} />
        <Kpi label="Sales" value={rm(s.sales)} />
        <Kpi label="Lead Conversion Rate" value={pct(s.conversionRate)} />
      </div>
      <Card className="mt-6 overflow-x-auto">
        <h2 className="px-5 pt-5 text-base font-semibold text-neutral-900">Marketing Performance by Platform</h2>
        {platforms.length === 0 ? (
          <EmptyState message="No data for this month." />
        ) : (
          <table className="mt-3 w-full min-w-[720px]">
            <thead className="border-y border-neutral-200 bg-neutral-50">
              <tr>{["Platform", "Leads", "Won", "Spend", "Sales", "Cost / Lead", "Conversion", "ROAS"].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {platforms.map((p) => (
                <tr key={p.platform}>
                  <td className={`${td} font-medium`}>{p.platform}</td>
                  <td className={td}>{p.leads}</td>
                  <td className={td}>{p.won}</td>
                  <td className={td}>{rm(p.spend)}</td>
                  <td className={td}>{rm(p.sales)}</td>
                  <td className={td}>{p.leads && p.spend ? rm(p.costPerLead) : "—"}</td>
                  <td className={td}>{pct(p.conversionRate)}</td>
                  <td className={`${td} font-semibold`}>{p.spend ? `${p.roas.toFixed(2)}x` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
