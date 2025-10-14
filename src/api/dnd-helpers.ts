// src/api/dnd-helpers.ts
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

export function arrayMove<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function normalizePositions<T extends { position?: number }>(arr: T[]) {
  return arr.map((x, i) => ({ ...x, position: i }));
}
