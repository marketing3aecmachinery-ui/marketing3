"use client";

import { useMemo, useState } from "react";
import { useData } from "@/data/DataProvider";
import { LEAD_STATUSES, PLATFORMS, type Lead } from "@/types";
import { dmy, monthKey, monthLabel, todayISO } from "@/lib/format";
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, Field, FormActions, Modal, PageHeader, inputCls, td, th,
} from "@/components/ui";

const blank = (): Omit<Lead, "id"> => ({
  customerName: "", phone: "", date: todayISO(), platform: "Facebook", machine: "", salesperson: "", status: "New",
});

function LeadForm({ initial, people, onSave, onCancel }: {
  initial: Omit<Lead, "id"> & { id?: string };
  people: string[];
  onSave: (l: Omit<Lead, "id"> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.customerName.trim() || !f.phone.trim() || !f.date) return setErr("Customer name, phone and date are required.");
        onSave({ ...f, customerName: f.customerName.trim(), phone: f.phone.trim() });
      }}
      className="space-y-4"
    >
      <Field label="Customer name"><input className={inputCls} value={f.customerName} onChange={(e) => set("customerName", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone number"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="012-345 6789" /></Field>
        <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Platform">
          <select className={inputCls} value={f.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value as Lead["status"])}>
            {LEAD_STATUSES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Interested machine"><input className={inputCls} value={f.machine} onChange={(e) => set("machine", e.target.value)} placeholder="e.g. CNC Lathe Machine" /></Field>
      <Field label="Salesperson">
        <input className={inputCls} list="people" value={f.salesperson} onChange={(e) => set("salesperson", e.target.value)} />
        <datalist id="people">{people.map((p) => <option key={p} value={p} />)}</datalist>
      </Field>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <FormActions onCancel={onCancel} submitLabel={f.id ? "Save changes" : "Add lead"} />
    </form>
  );
}

export default function LeadsPage() {
  const { leads } = useData();
  const [month, setMonth] = useState("");
  const [person, setPerson] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<(Omit<Lead, "id"> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const months = useMemo(() => [...new Set(leads.items.map((l) => monthKey(l.date)))].sort().reverse(), [leads.items]);
  const people = useMemo(() => [...new Set(leads.items.map((l) => l.salesperson).filter(Boolean))].sort(), [leads.items]);
  const platforms = useMemo(() => [...new Set([...PLATFORMS, ...leads.items.map((l) => l.platform)])], [leads.items]);

  const rows = useMemo(
    () =>
      leads.items
        .filter((l) => (!month || monthKey(l.date) === month) && (!person || l.salesperson === person) && (!platform || l.platform === platform) && (!status || l.status === status))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [leads.items, month, person, platform, status],
  );
  const filtered = month || person || platform || status;

  return (
    <>
      <PageHeader title="Lead Tracking" subtitle={`${rows.length} of ${leads.items.length} leads shown`} actions={<Button onClick={() => setEditing(blank())}>+ Add Lead</Button>} />
      <Card className="mb-4 grid grid-cols-2 gap-3 p-4 lg:grid-cols-5">
        <select className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month">
          <option value="">All months</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <select className={inputCls} value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Filter by salesperson">
          <option value="">All salespeople</option>
          {people.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={inputCls} value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Filter by platform">
          <option value="">All platforms</option>
          {platforms.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <Button variant="secondary" disabled={!filtered} onClick={() => { setMonth(""); setPerson(""); setPlatform(""); setStatus(""); }}>Clear filters</Button>
      </Card>
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState message={leads.items.length === 0 ? "No leads yet. Click “+ Add Lead” to record your first one." : "No leads match these filters."} />
        ) : (
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>{["Date", "Customer", "Phone", "Platform", "Machine", "Salesperson", "Status", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50">
                  <td className={td}>{dmy(l.date)}</td>
                  <td className={`${td} font-medium`}>{l.customerName}</td>
                  <td className={td}>{l.phone}</td>
                  <td className={td}>{l.platform}</td>
                  <td className={td}>{l.machine}</td>
                  <td className={td}>{l.salesperson}</td>
                  <td className={td}><Badge>{l.status}</Badge></td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" className="!px-2" onClick={() => setEditing(l)}>Edit</Button>
                    <Button variant="ghost" className="!px-2 !text-red-600" onClick={() => setDeleting(l)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={editing !== null} title={editing?.id ? "Edit Lead" : "Add Lead"} onClose={() => setEditing(null)}>
        {editing && (
          <LeadForm
            initial={editing}
            people={people}
            onCancel={() => setEditing(null)}
            onSave={async (l) => {
              if (l.id) await leads.update(l as Lead);
              else await leads.add(l);
              setEditing(null);
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete lead?"
        message={`Delete ${deleting?.customerName ?? "this lead"}? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) await leads.remove(deleting.id); setDeleting(null); }}
      />
    </>
  );
}
