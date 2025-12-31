/**
 * Safe localStorage operations with quota handling
 */

export const safeSetLocalStorage = (key, value) => {
    try {
        const str = JSON.stringify(value);
        // Check size (rough estimation: 1 char ≈ 2 bytes in UTF-16)
        const sizeInBytes = str.length * 2;
        const maxSize = 4 * 1024 * 1024; // 4MB limit (conservative)
        
        if (sizeInBytes > maxSize) {
            console.warn(`Data too large for localStorage (${Math.round(sizeInBytes / 1024 / 1024)}MB), skipping cache`);
            return false;
        }
        
        localStorage.setItem(key, str);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.error('localStorage quota exceeded, clearing old data');
            
            // Clear old section caches (keep only recent 5)
            try {
                const sectionKeys = Object.keys(localStorage)
                    .filter(k => k.startsWith('prephub_section_'))
                    .sort((a, b) => {
                        const aTime = localStorage.getItem(`${a}_timestamp`) || '0';
                        const bTime = localStorage.getItem(`${b}_timestamp`) || '0';
                        return aTime - bTime; // Oldest first
                    });
                
                // Remove oldest entries except last 5
                const keysToRemove = sectionKeys.slice(0, Math.max(0, sectionKeys.length - 5));
                keysToRemove.forEach(k => {
                    localStorage.removeItem(k);
                    localStorage.removeItem(`${k}_timestamp`);
                });
                
                // Try again after cleanup
                localStorage.setItem(key, JSON.stringify(value));
                localStorage.setItem(`${key}_timestamp`, Date.now().toString());
                return true;
            } catch (e2) {
                console.error('Failed even after cleanup:', e2);
                return false;
            }
        }
        console.error('localStorage error:', e);
        return false;
    }
};

export const safeGetLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
};

export const clearOldCaches = (prefix = 'prephub_', maxAge = 7 * 24 * 60 * 60 * 1000) => {
    try {
        const now = Date.now();
        Object.keys(localStorage)
            .filter(k => k.startsWith(prefix))
            .forEach(k => {
                const timestamp = localStorage.getItem(`${k}_timestamp`);
                if (timestamp && (now - parseInt(timestamp)) > maxAge) {
                    localStorage.removeItem(k);
                    localStorage.removeItem(`${k}_timestamp`);
                }
            });
    } catch (e) {
        console.error('Error clearing old caches:', e);
    }
};

export default {
    safeSetLocalStorage,
    safeGetLocalStorage,
    clearOldCaches
};
