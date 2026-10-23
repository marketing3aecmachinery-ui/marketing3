"use client";

import { useMemo, useState } from "react";
import { useData } from "@/data/DataProvider";
import { PRIORITIES, TASK_STATUSES, type Task } from "@/types";
import { dmy, todayISO } from "@/lib/format";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, FormActions, Modal, PageHeader, inputCls } from "@/components/ui";

type Draft = Omit<Task, "id"> & { id?: string };
const blank = (): Draft => ({ name: "", assignee: "", dueDate: todayISO(), priority: "Medium", status: "To Do" });

function TaskForm({ initial, people, onSave, onCancel }: { initial: Draft; people: string[]; onSave: (t: Draft) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim() || !f.dueDate) return setErr("Task name and due date are required.");
        onSave({ ...f, name: f.name.trim() });
      }}
      className="space-y-4"
    >
      <Field label="Task name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Assigned person">
          <input className={inputCls} list="assignees" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} />
          <datalist id="assignees">{people.map((p) => <option key={p} value={p} />)}</datalist>
        </Field>
        <Field label="Due date"><input type="date" className={inputCls} value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Priority">
          <select className={inputCls} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Task["priority"] })}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Task["status"] })}>
            {TASK_STATUSES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <FormActions onCancel={onCancel} submitLabel={f.id ? "Save changes" : "Add task"} />
    </form>
  );
}

export default function TasksPage() {
  const { tasks } = useData();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const people = useMemo(() => [...new Set(tasks.items.map((t) => t.assignee).filter(Boolean))].sort(), [tasks.items]);
  const today = todayISO();

  return (
    <>
      <PageHeader title="Marketing Tasks" subtitle={`${tasks.items.filter((t) => t.status !== "Completed").length} open tasks`} actions={<Button onClick={() => setEditing(blank())}>+ Add Task</Button>} />
      {tasks.items.length === 0 ? (
        <Card><EmptyState message="No tasks yet. Click “+ Add Task”." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TASK_STATUSES.map((status) => {
            const col = tasks.items.filter((t) => t.status === status).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
            return (
              <div key={status} className="rounded-xl bg-neutral-100 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-neutral-800">{status}</h2>
                  <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">{col.length}</span>
                </div>
                <div className="space-y-3">
                  {col.map((t) => {
                    const overdue = t.status !== "Completed" && t.dueDate < today;
                    return (
                      <Card key={t.id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`text-sm font-medium ${t.status === "Completed" ? "text-neutral-400 line-through" : "text-neutral-900"}`}>{t.name}</div>
                          <Badge>{t.priority}</Badge>
                        </div>
                        <div className="mt-2 text-xs text-neutral-500">{t.assignee || "Unassigned"}</div>
                        <div className={`text-xs ${overdue ? "font-semibold text-red-600" : "text-neutral-500"}`}>Due {dmy(t.dueDate)}{overdue && " · overdue"}</div>
                        <div className="mt-3 flex items-center gap-2">
                          <select
                            aria-label="Change status"
                            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
                            value={t.status}
                            onChange={(e) => tasks.update({ ...t, status: e.target.value as Task["status"] })}
                          >
                            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => setEditing(t)}>Edit</Button>
                          <Button variant="ghost" className="!px-2 !py-1 !text-xs !text-red-600" onClick={() => setDeleting(t)}>Delete</Button>
                        </div>
                      </Card>
                    );
                  })}
                  {col.length === 0 && <p className="px-1 py-4 text-center text-xs text-neutral-400">Nothing here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={editing !== null} title={editing?.id ? "Edit Task" : "Add Task"} onClose={() => setEditing(null)}>
        {editing && (
          <TaskForm
            initial={editing}
            people={people}
            onCancel={() => setEditing(null)}
            onSave={async (t) => {
              if (t.id) await tasks.update(t as Task);
              else await tasks.add(t);
              setEditing(null);
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete task?"
        message={`Delete “${deleting?.name ?? ""}”?`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) await tasks.remove(deleting.id); setDeleting(null); }}
      />
    </>
  );
}
