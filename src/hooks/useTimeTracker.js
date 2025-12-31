import { useState, useEffect, useRef } from 'react';
import { progressAPI } from '../services/api';

export const useTimeTracker = (sectionId, topicSlug, sectionSlug) => {
    const [timeSpent, setTimeSpent] = useState(0);
    const intervalRef = useRef(null);
    const lastSaveRef = useRef(0);

    useEffect(() => {
        if (!sectionId || !topicSlug || !sectionSlug) return;

        intervalRef.current = setInterval(() => {
            setTimeSpent(prev => {
                const newTime = prev + 1;
                
                if (newTime - lastSaveRef.current >= 5) {
                    saveTime(newTime);
                    lastSaveRef.current = newTime;
                }
                
                return newTime;
            });
        }, 60000);

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
        }
    };

    return timeSpent;
};

export default useTimeTracker;
