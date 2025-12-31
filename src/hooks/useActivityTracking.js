import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsAPI from '../services/analyticsAPI';

/**
 * Hook to track user activity on a page/component
 * @param {string} topicSlug - Topic being viewed
 * @param {object} metadata - Additional metadata (sectionSlug, categorySlug, etc.)
 */
export const useActivityTracking = (topicSlug, metadata = {}) => {
    const { user } = useAuth();
    const enteredAt = useRef(Date.now());
    const trackedView = useRef(false);

    useEffect(() => {
        // Only track for logged-in users
        if (!user || !topicSlug) return;

        // Track view on mount (only once)
        if (!trackedView.current) {
            analyticsAPI.trackActivity({
                topicSlug,
                activityType: 'view',
                duration: 0,
                metadata
            });
            trackedView.current = true;
        }

        // Track duration on unmount
        return () => {
            const duration = (Date.now() - enteredAt.current) / 1000; // Convert to seconds
            
            // Only track if stayed for more than 5 seconds
            if (duration > 5) {
                analyticsAPI.trackActivity({
                    topicSlug,
                    activityType: 'view',
                    duration: Math.round(duration),
                    metadata
                });
            }
        };
    }, [topicSlug, user, metadata]);
};

/**
 * Manual tracking functions
 */
export const trackCompletion = async (topicSlug, metadata = {}) => {
    return analyticsAPI.trackActivity({
        topicSlug,
        activityType: 'complete',
        duration: 0,
        metadata
    });
};

export const trackPractice = async (topicSlug, duration, metadata = {}) => {
    return analyticsAPI.trackActivity({
        topicSlug,
        activityType: 'practice',
        duration,
        metadata
    });
};

export const trackQuiz = async (topicSlug, metadata = {}) => {
    return analyticsAPI.trackActivity({
        topicSlug,
        activityType: 'quiz',
        duration: 0,
        metadata
    });
};

export default useActivityTracking;
