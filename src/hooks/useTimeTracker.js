import { useState, useEffect, useRef } from 'react';
import { progressAPI } from '../services/api';

/**
 * Custom hook to track time spent on a section
 * Automatically saves time to backend on unmount or every 5 minutes
 * 
 * @param {string} sectionId - Section ID to track
 * @param {string} topicSlug - Topic slug
 * @param {string} sectionSlug - Section slug
 * @returns {number} timeSpent - Minutes spent on section
 */
export const useTimeTracker = (sectionId, topicSlug, sectionSlug) => {
    const [timeSpent, setTimeSpent] = useState(0);
    const intervalRef = useRef(null);
    const lastSaveRef = useRef(0);

    useEffect(() => {
        if (!sectionId || !topicSlug || !sectionSlug) return;

        // Track time every minute
        intervalRef.current = setInterval(() => {
            setTimeSpent(prev => {
                const newTime = prev + 1;
                
                // Auto-save every 5 minutes to reduce DB writes
                if (newTime - lastSaveRef.current >= 5) {
                    saveTime(newTime);
                    lastSaveRef.current = newTime;
                }
                
                return newTime;
            });
        }, 60000); // 1 minute

        // Cleanup: save time on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeSpent > 0) {
                saveTime(timeSpent);
            }
        };
    }, [sectionId, topicSlug, sectionSlug]);

    const saveTime = async (minutes) => {
        if (minutes === 0) return;
        
        try {
            await progressAPI.updateTime(topicSlug, sectionSlug, minutes);
        } catch (error) {
            console.error('Failed to save time:', error);
            // Silent fail - don't interrupt user experience
        }
    };

    return timeSpent;
};

export default useTimeTracker;
