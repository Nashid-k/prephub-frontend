import { useEffect, useRef, useState } from 'react';
import { progressAPI } from '../services/api';

/**
 * Hook to track study time for a section
 * Auto-saves progress and handles page visibility changes
 */
export const useStudyTimer = (topicSlug, sectionSlug, isActive = true) => {
    const [timeSpent, setTimeSpent] = useState(0); // seconds
    const startTimeRef = useRef(null);
    const intervalRef = useRef(null);
    const lastSaveRef = useRef(Date.now());

    // Start session when component mounts
    useEffect(() => {
        if (!isActive || !topicSlug || !sectionSlug) return;

        const startSession = async () => {
            try {
                await progressAPI.startStudySession(topicSlug, sectionSlug);
                startTimeRef.current = Date.now();
                lastSaveRef.current = Date.now();
            } catch (error) {
                console.error('Failed to start study session:', error);
            }
        };

        startSession();

        // Start interval to track time
        intervalRef.current = setInterval(() => {
            if (startTimeRef.current && document.visibilityState === 'visible') {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimeSpent(elapsed);

                // Auto-save every 60 seconds
                if (Date.now() - lastSaveRef.current >= 60000) {
                    saveProgress(elapsed);
                    lastSaveRef.current = Date.now();
                }
            }
        }, 1000);

        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Save progress when tab becomes inactive
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                saveProgress(elapsed);
            } else {
                // Resume timer when tab becomes active
                startTimeRef.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Save progress before leaving page
        const handleBeforeUnload = () => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            saveProgress(elapsed, true); // Synchronous save
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            
            // Save final time
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                saveProgress(elapsed);
            }
        };
    }, [topicSlug, sectionSlug, isActive]);

    const saveProgress = async (duration, sync = false) => {
        if (duration < 5) return; // Don't save sessions under 5 seconds

        try {
            if (sync) {
                // Synchronous save using sendBeacon for page unload
                const data = JSON.stringify({ 
                    topicSlug, 
                    sectionSlug, 
                    duration 
                });
                const token = localStorage.getItem('token');
                const sessionId = localStorage.getItem('sessionId');
                
                const blob = new Blob([data], { type: 'application/json' });
                const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/progress/session/end`;
                
                navigator.sendBeacon(url, blob);
            } else {
                await progressAPI.endStudySession(topicSlug, sectionSlug, duration);
                console.log(`Saved ${duration}s of study time for ${sectionSlug}`);
            }
        } catch (error) {
            console.error('Failed to save study time:', error);
        }
    };

    // Format time as HH:MM:SS
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        timeSpent,
        formattedTime: formatTime(timeSpent),
        saveProgress: () => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            return saveProgress(elapsed);
        }
    };
};
