// Lightweight request tracker with EWMA duration estimation and listener support
const listeners = new Set();
let nextId = 1;
const inflight = new Map();
const ewma = new Map(); // key -> { avg, alpha }

function emit() {
  const snapshot = {
    inflight: Array.from(inflight.values()).map(r => ({ id: r.id, url: r.url, method: r.method, startTime: r.startTime })),
    ewma: Object.fromEntries(Array.from(ewma.entries()).map(([k, v]) => [k, v.avg]))
  };
  listeners.forEach(cb => cb(snapshot));
}

export function onChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function startRequest({ url = '', method = 'GET' } = {}) {
  const id = String(nextId++);
  const startTime = performance.now();
  const key = normalizeKey(url);
  inflight.set(id, { id, url, method, startTime, key });
  emit();
  return id;
}

export function endRequest(id, success = true) {
  const now = performance.now();
  const r = inflight.get(id);
  if (!r) return;
  const dur = Math.max(2, now - r.startTime);
  // update EWMA
  const key = r.key;
  const prev = ewma.get(key) || { avg: dur, alpha: 0.15 };
  const alpha = prev.alpha || 0.15;
  const newAvg = prev.avg ? alpha * dur + (1 - alpha) * prev.avg : dur;
  ewma.set(key, { avg: newAvg, alpha });
  inflight.delete(id);
  emit();
}

export function getEstimateFor(url) {
  const key = normalizeKey(url);
  const v = ewma.get(key);
  return v ? v.avg : 3000; // default 3s
}

function normalizeKey(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.replace(/\/\d+/g, '/:id');
  } catch (e) {
    return url;
  }
}

export default { onChange, startRequest, endRequest, getEstimateFor };