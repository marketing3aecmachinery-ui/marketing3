"use client";

import { useEffect } from "react";

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
    danger: "bg-neutral-900 text-white hover:bg-black",
    ghost: "text-neutral-600 hover:bg-neutral-100",
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-neutral-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="text-2xl leading-none text-neutral-400 hover:text-neutral-700">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-neutral-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

const BADGE: Record<string, string> = {
  New: "bg-neutral-100 text-neutral-700",
  Contacted: "bg-blue-50 text-blue-700",
  "Quotation Sent": "bg-amber-50 text-amber-700",
  Won: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
  Low: "bg-neutral-100 text-neutral-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
  "To Do": "bg-neutral-100 text-neutral-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-green-50 text-green-700",
};

export function Badge({ children }: { children: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[children] ?? BADGE.New}`}>
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="px-4 py-12 text-center text-sm text-neutral-500">{message}</div>;
}

export function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500";
export const td = "px-4 py-3 text-sm text-neutral-800";
