import type { Repository } from "./repository";

export class LocalStorageRepo<T extends { id: string }> implements Repository<T> {
  constructor(
    private key: string,
    private seed: () => T[],
  ) {}

  private read(): T[] {
    const raw = window.localStorage.getItem(this.key);
    if (raw === null) {
      const seeded = this.seed();
      this.write(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private write(items: T[]) {
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }

  async list() {
    return this.read();
  }

  async create(item: Omit<T, "id">) {
    const created = { ...item, id: crypto.randomUUID() } as T;
    this.write([...this.read(), created]);
    return created;
  }

  async update(item: T) {
    this.write(this.read().map((x) => (x.id === item.id ? item : x)));
    return item;
  }

  async remove(id: string) {
    this.write(this.read().filter((x) => x.id !== id));
  }

  async replaceAll(items: T[]) {
    this.write(items);
  }
}
