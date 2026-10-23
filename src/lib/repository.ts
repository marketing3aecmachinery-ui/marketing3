/**
 * Storage contract used by the whole app. V1 implements it with LocalStorage
 * (see localStorageRepo.ts). To move to Supabase later, write a class with the
 * same methods that talks to a Supabase table and swap it in data/DataProvider.tsx.
 */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  create(item: Omit<T, "id">): Promise<T>;
  update(item: T): Promise<T>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<void>;
}
