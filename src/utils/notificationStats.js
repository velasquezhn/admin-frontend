export function attentionNotificationCount(stats = {}) {
  const pending = Number(stats.pending || 0);
  const dead = Number(stats.dead || 0);
  return Math.max(0, pending) + Math.max(0, dead);
}
