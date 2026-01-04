import { useEffect, useState } from 'react';

// Simple heuristic for low-power devices
export default function usePerformanceProfile() {
  const [profile, setProfile] = useState({ lowPower: false, prefersReducedMotion: false });

  useEffect(() => {
    const deviceMemory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 4;
    const lowPower = deviceMemory <= 2 || cores <= 2;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setProfile({ lowPower, prefersReducedMotion });
  }, []);

  return profile;
}
