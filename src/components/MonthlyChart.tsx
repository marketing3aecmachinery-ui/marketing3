"use client";

import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthRow } from "@/lib/calc";
import { monthLabel, rm } from "@/lib/format";

export function MonthlyChart({ data }: { data: MonthRow[] }) {
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="rm" tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
          <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(v, name) => (name === "Leads" ? String(v) : rm(Number(v)))} />
          <Legend />
          <Bar yAxisId="rm" dataKey="spend" name="Ad Spend (RM)" fill="#171717" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="rm" dataKey="sales" name="Sales (RM)" fill="#dc2626" radius={[3, 3, 0, 0]} />
          <Line yAxisId="leads" dataKey="leads" name="Leads" stroke="#a3a3a3" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
