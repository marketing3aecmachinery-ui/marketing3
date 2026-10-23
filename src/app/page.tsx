"use client";

import { useMemo } from "react";
import { useData } from "@/data/DataProvider";
import { monthlySeries, summarize } from "@/lib/calc";
import { pct, rm } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";
import { MonthlyChart } from "@/components/MonthlyChart";

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <Card className={`p-5 ${accent ? "border-l-4 border-l-red-600" : ""}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </Card>
  );
}

export default function OverviewPage() {
  const { leads, ads } = useData();
  const s = useMemo(() => summarize(leads.items, ads.items), [leads.items, ads.items]);
  const series = useMemo(() => monthlySeries(leads.items, ads.items, 6), [leads.items, ads.items]);

  return (
    <>
      <PageHeader title="Overview" subtitle="All-time marketing summary for AEC Machinery (M) Sdn Bhd" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Leads" value={String(s.leads)} hint={`${s.won} won`} accent />
        <StatCard label="Marketing Expenses" value={rm(s.spend)} />
        <StatCard label="Sales Generated" value={rm(s.sales)} hint={`ROAS ${s.roas.toFixed(2)}x`} />
        <StatCard label="Cost Per Lead" value={rm(s.costPerLead)} />
        <StatCard label="Conversion Rate" value={pct(s.conversionRate)} hint="Won ÷ total leads" />
      </div>
      <Card className="mt-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">Monthly Performance (last 6 months)</h2>
        <MonthlyChart data={series} />
      </Card>
    </>
  );
}
