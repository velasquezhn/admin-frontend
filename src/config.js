export function normalizeApiUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}
