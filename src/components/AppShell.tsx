"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useData } from "@/data/DataProvider";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "./ui";

const NAV = [
  { href: "/", label: "Overview", icon: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" },
  { href: "/leads", label: "Lead Tracking", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H2v-2a4 4 0 014-4h3a4 4 0 014 4v2zM12 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/ads", label: "Advertising", icon: "M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7" },
  { href: "/tasks", label: "Marketing Tasks", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  { href: "/report", label: "Monthly Report", icon: "M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { href: "/account", label: "Account Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetDemo, clearAll, ready } = useData();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "reset" | "clear">(null);

  const sidebar = (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="border-b border-neutral-800 px-5 py-5">
        <div className="text-lg font-bold tracking-tight">
          AEC <span className="text-red-600">Machinery</span>
        </div>
        <div className="text-xs text-neutral-400">Marketing Dashboard V1.0</div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((n) => {
          const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-red-600 text-white" : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon d={n.icon} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-neutral-800 p-3">
        <p className="px-1 text-[11px] uppercase tracking-wide text-neutral-500">Data (saved in Supabase)</p>
        <button onClick={() => setConfirm("reset")} className="w-full rounded-md border border-neutral-700 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900">
          Reset demo data
        </button>
        <button onClick={() => setConfirm("clear")} className="w-full rounded-md border border-neutral-700 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900">
          Clear all data
        </button>
        <button onClick={() => void supabase.auth.signOut()} className="w-full rounded-md bg-neutral-800 px-3 py-2 text-left text-xs text-white hover:bg-neutral-700">
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-black px-4 py-3 text-white lg:hidden">
        <div className="font-bold">
          AEC <span className="text-red-600">Machinery</span>
        </div>
        <button aria-label="Menu" onClick={() => setOpen(true)} className="rounded p-1 hover:bg-neutral-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {ready ? children : <div className="py-20 text-center text-sm text-neutral-500">Loading…</div>}
        </div>
      </main>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "reset" ? "Reset demo data?" : "Clear all data?"}
        message={
          confirm === "reset"
            ? "This replaces ALL leads, campaigns and tasks with the original demo data."
            : "This deletes ALL leads, campaigns and tasks so you can start with your own data."
        }
        confirmLabel={confirm === "reset" ? "Reset" : "Clear all"}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm === "reset") await resetDemo();
          else await clearAll();
          setConfirm(null);
        }}
      />
    </div>
  );
}
