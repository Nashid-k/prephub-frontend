import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import tracker from '../utils/requestTracker';

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const [snapshot, setSnapshot] = useState({ inflight: [], ewma: {} });
  useEffect(() => tracker.onChange(s => setSnapshot(s)), []);

  const activeCount = snapshot.inflight.length;

  // ETA: max remaining time across inflight requests (in ms)
  const eta = useMemo(() => {
    if (!snapshot.inflight.length) return 0;
    const now = performance.now();
    let maxRem = 0;
    snapshot.inflight.forEach(r => {
      const avg = snapshot.ewma[r.key] || tracker.getEstimateFor(r.url);
      const elapsed = Math.max(0, now - r.startTime);
      const rem = Math.max(0, avg - elapsed);
      if (rem > maxRem) maxRem = rem;
    });
    return Math.round(maxRem);
  }, [snapshot]);

  const progress = useMemo(() => {
    // simple heuristic: percent based on ETA relative to a 10s max
    const max = 10000;
    if (activeCount === 0) return 100;
    const p = Math.round(100 * (1 - Math.min(1, eta / max)));
    return Math.max(10, p);
  }, [eta, activeCount]);

  const aiHint = useMemo(() => {
    if (activeCount === 0) return null;
    // pick the most expensive-looking inflight by avg
    const items = snapshot.inflight.map(r => ({ ...r, avg: snapshot.ewma[r.key] || tracker.getEstimateFor(r.url) }));
    items.sort((a, b) => b.avg - a.avg);
    const top = items[0];
    // Heuristic message
    const seconds = Math.round((snapshot.ewma[top.key] || tracker.getEstimateFor(top.url)) / 1000);
    if (top.url.includes('/ai')) return `Thinking like an expert tutor — this usually takes ~${seconds}s.`;
    if (top.url.includes('/compiler') || top.url.includes('/execute')) return `Running code securely — estimated ~${seconds}s.`;
    if (top.url.includes('/curriculum')) return `Fetching course content — usually finishes in ~${seconds}s.`;
    return `Working on ${top.url.split('/').pop() || 'your request'} — expected ~${seconds}s.`;
  }, [snapshot, activeCount]);

  const value = {
    activeCount,
    eta,
    progress,
    aiHint,
    snapshot
  };

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error('useLoader must be used within LoaderProvider');
  return ctx;
}

export default LoaderContext;