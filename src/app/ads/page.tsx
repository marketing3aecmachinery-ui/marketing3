"use client";

import { useMemo, useState } from "react";
import { useData } from "@/data/DataProvider";
import { ADS_PLATFORMS, type AdCampaign } from "@/types";
import { adCostPerLead, adRoas } from "@/lib/calc";
import { dmy, rm, todayISO } from "@/lib/format";
import { Button, Card, ConfirmDialog, EmptyState, Field, FormActions, Modal, PageHeader, inputCls, td, th } from "@/components/ui";

type Draft = Omit<AdCampaign, "id"> & { id?: string };
const blank = (): Draft => ({ campaignName: "", platform: "Facebook", date: todayISO(), spend: 0, leads: 0, sales: 0 });

function AdForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (a: Draft) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  const num = (k: "spend" | "leads" | "sales", v: string) => setF((p) => ({ ...p, [k]: v === "" ? 0 : Math.max(0, Number(v)) }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.campaignName.trim() || !f.date) return setErr("Campaign name and date are required.");
        onSave({ ...f, campaignName: f.campaignName.trim(), leads: Math.round(f.leads) });
      }}
      className="space-y-4"
    >
      <Field label="Campaign name"><input className={inputCls} value={f.campaignName} onChange={(e) => setF({ ...f, campaignName: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Platform">
          <select className={inputCls} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
            {[...new Set([...ADS_PLATFORMS, f.platform])].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Ad spend (RM)"><input type="number" min="0" step="0.01" className={inputCls} value={f.spend || ""} onChange={(e) => num("spend", e.target.value)} /></Field>
        <Field label="Leads"><input type="number" min="0" step="1" className={inputCls} value={f.leads || ""} onChange={(e) => num("leads", e.target.value)} /></Field>
        <Field label="Sales (RM)"><input type="number" min="0" step="0.01" className={inputCls} value={f.sales || ""} onChange={(e) => num("sales", e.target.value)} /></Field>
      </div>
      <p className="text-xs text-neutral-500">Cost per lead and ROAS are calculated automatically.</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <FormActions onCancel={onCancel} submitLabel={f.id ? "Save changes" : "Add campaign"} />
    </form>
  );
}

export default function AdsPage() {
  const { ads } = useData();
  const [platform, setPlatform] = useState("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<AdCampaign | null>(null);

  const rows = useMemo(
    () => ads.items.filter((a) => !platform || a.platform === platform).sort((a, b) => b.date.localeCompare(a.date)),
    [ads.items, platform],
  );
  const platforms = useMemo(() => [...new Set([...ADS_PLATFORMS, ...ads.items.map((a) => a.platform)])], [ads.items]);
  const totals = useMemo(() => {
    const spend = rows.reduce((s, a) => s + a.spend, 0);
    const leads = rows.reduce((s, a) => s + a.leads, 0);
    const sales = rows.reduce((s, a) => s + a.sales, 0);
    return { spend, leads, sales, cpl: adCostPerLead({ spend, leads }), roas: adRoas({ spend, sales }) };
  }, [rows]);

  return (
    <>
      <PageHeader
        title="Advertising Performance"
        subtitle="Facebook, TikTok, Google and other campaigns"
        actions={<Button onClick={() => setEditing(blank())}>+ Add Campaign</Button>}
      />
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <select className={`${inputCls} !w-auto`} value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Filter by platform">
          <option value="">All platforms</option>
          {platforms.map((p) => <option key={p}>{p}</option>)}
        </select>
        <div className="ml-auto flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-600">
          <span>Spend <b className="text-neutral-900">{rm(totals.spend)}</b></span>
          <span>Leads <b className="text-neutral-900">{totals.leads}</b></span>
          <span>Sales <b className="text-neutral-900">{rm(totals.sales)}</b></span>
          <span>CPL <b className="text-neutral-900">{rm(totals.cpl)}</b></span>
          <span>ROAS <b className="text-red-600">{totals.roas.toFixed(2)}x</b></span>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState message={ads.items.length === 0 ? "No campaigns yet. Click “+ Add Campaign”." : "No campaigns for this platform."} />
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                {["Campaign", "Platform", "Date", "Spend", "Leads", "Sales", "Cost / Lead", "ROAS", ""].map((h) => <th key={h} className={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className={`${td} font-medium`}>{a.campaignName}</td>
                  <td className={td}>{a.platform}</td>
                  <td className={td}>{dmy(a.date)}</td>
                  <td className={td}>{rm(a.spend)}</td>
                  <td className={td}>{a.leads}</td>
                  <td className={td}>{rm(a.sales)}</td>
                  <td className={td}>{a.leads ? rm(adCostPerLead(a)) : "—"}</td>
                  <td className={`${td} font-semibold`}>{a.spend ? `${adRoas(a).toFixed(2)}x` : "—"}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" className="!px-2" onClick={() => setEditing(a)}>Edit</Button>
                    <Button variant="ghost" className="!px-2 !text-red-600" onClick={() => setDeleting(a)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={editing !== null} title={editing?.id ? "Edit Campaign" : "Add Campaign"} onClose={() => setEditing(null)}>
        {editing && (
          <AdForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={async (a) => {
              if (a.id) await ads.update(a as AdCampaign);
              else await ads.add(a);
              setEditing(null);
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete campaign?"
        message={`Delete “${deleting?.campaignName ?? ""}”? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) await ads.remove(deleting.id); setDeleting(null); }}
      />
    </>
  );
}
