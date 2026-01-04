import { useEffect, useState } from 'react';

const CACHE_KEY = 'prephub_performance_profile';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Enhanced heuristic for device performance profiling
export default function usePerformanceProfile() {
  const [profile, setProfile] = useState({
    lowPower: false,
    prefersReducedMotion: false,
    slowConnection: false,
    batteryLow: false,
    performanceScore: 100
  });

  useEffect(() => {
    // Check for cached profile
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setProfile(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached performance profile', e);
    }

    // Detect performance characteristics
    const detectProfile = async () => {
      const deviceMemory = navigator.deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect low power mode
      const lowPowerByHardware = deviceMemory <= 2 || cores <= 2;

      // Detect slow connection
      let slowConnection = false;
      if ('connection' in navigator) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          // 3g or slower, or save-data mode
          slowConnection = conn.effectiveType === 'slow-2g' ||
            conn.effectiveType === '2g' ||
            conn.effectiveType === '3g' ||
            conn.saveData === true;
        }
      }

      // Detect battery status
      let batteryLow = false;
      try {
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery();
          // Consider battery low if < 20% and not charging
          batteryLow = battery.level < 0.2 && !battery.charging;
        }
      } catch (e) {
        // Battery API not supported or blocked
      }

      // Calculate performance score (0-100)
      let score = 100;
      if (deviceMemory <= 2) score -= 30;
      else if (deviceMemory <= 4) score -= 15;
      if (cores <= 2) score -= 25;
      else if (cores <= 4) score -= 10;
      if (slowConnection) score -= 20;
      if (batteryLow) score -= 15;
      if (prefersReducedMotion) score -= 10;

      const lowPower = lowPowerByHardware || slowConnection || batteryLow || score < 50;

      const newProfile = {
        lowPower,
        prefersReducedMotion,
        slowConnection,
        batteryLow,
        performanceScore: Math.max(0, score)
      };

      setProfile(newProfile);

      // Cache the result
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newProfile,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache performance profile', e);
      }
    };

    detectProfile();
  }, []);

  return profile;
}
