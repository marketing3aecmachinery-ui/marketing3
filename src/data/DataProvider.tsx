"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { AdCampaign, Lead, Task } from "@/types";
import type { Repository } from "@/lib/repository";
import { adsRepo, leadsRepo, tasksRepo } from "@/lib/supabaseRepo";
import { seedAds, seedLeads, seedTasks } from "@/lib/seed";

export interface Collection<T extends { id: string }> {
  items: T[];
  add: (item: Omit<T, "id">) => Promise<void>;
  update: (item: T) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function useCollection<T extends { id: string }>(repo: Repository<T>, ready: boolean) {
  const [items, setItems] = useState<T[]>([]);

  const reload = useCallback(async () => setItems(await repo.list()), [repo]);

  useEffect(() => {
    if (ready) void repo.list().then(setItems).catch((e) => console.error(e));
  }, [ready, repo]);

  const collection: Collection<T> = {
    items,
    add: async (item) => {
      const created = await repo.create(item);
      setItems((prev) => [...prev, created]);
    },
    update: async (item) => {
      await repo.update(item);
      setItems((prev) => prev.map((x) => (x.id === item.id ? item : x)));
    },
    remove: async (id) => {
      await repo.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
  };
  return { collection, reload };
}

interface DataContextValue {
  leads: Collection<Lead>;
  ads: Collection<AdCampaign>;
  tasks: Collection<Task>;
  ready: boolean;
  resetDemo: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const repos = useMemo(() => ({ leads: leadsRepo(), ads: adsRepo(), tasks: tasksRepo() }), []);

  // false while rendering on the server, true in the browser.
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const leads = useCollection(repos.leads, ready);
  const ads = useCollection(repos.ads, ready);
  const tasks = useCollection(repos.tasks, ready);

  const resetDemo = useCallback(async () => {
    await Promise.all([
      repos.leads.replaceAll(seedLeads()),
      repos.ads.replaceAll(seedAds()),
      repos.tasks.replaceAll(seedTasks()),
    ]);
    await Promise.all([leads.reload(), ads.reload(), tasks.reload()]);
  }, [repos, leads, ads, tasks]);

  const clearAll = useCallback(async () => {
    await Promise.all([repos.leads.replaceAll([]), repos.ads.replaceAll([]), repos.tasks.replaceAll([])]);
    await Promise.all([leads.reload(), ads.reload(), tasks.reload()]);
  }, [repos, leads, ads, tasks]);

  const value: DataContextValue = {
    leads: leads.collection,
    ads: ads.collection,
    tasks: tasks.collection,
    ready,
    resetDemo,
    clearAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
