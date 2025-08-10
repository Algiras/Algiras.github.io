export function msRemaining(targetMs?: number): number {
  const now = Date.now();
  if (!targetMs) return 0;
  return Math.max(0, targetMs - now);
}

export function formatSeconds(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 0) return `${m}:${String(r).padStart(2, '0')}`;
  return `${r}s`;
}


