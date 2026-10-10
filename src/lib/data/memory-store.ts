/**
 * Demo-mode (no database) data lives in memory. In `next dev` each API route can be bundled
 * separately, so a plain module-level variable would give every route its OWN copy of the data
 * (approve in one route, send in another, and the send would not see the approval).
 * Keeping the holder on globalThis gives every route and page the same copy.
 */
const g = globalThis as unknown as { __sponfyMemory?: Record<string, { value: unknown }> };

export function memoryStore<T>(key: string, init: () => T): { value: T } {
  const bag = (g.__sponfyMemory ??= {});
  if (!bag[key]) bag[key] = { value: init() };
  return bag[key] as { value: T };
}
