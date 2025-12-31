import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsAPI from '../services/analyticsAPI';

export const useActivityTracking = (topicSlug, metadata = {}) => {
    const { user } = useAuth();
    const enteredAt = useRef(Date.now());
    const trackedView = useRef(false);

    useEffect(() => {
        if (!user || !topicSlug) return;

        if (!trackedView.current) {
            analyticsAPI.trackActivity({
                topicSlug,
                activityType: 'view',
                duration: 0,
                metadata
            });
            trackedView.current = true;
        }

        return () => {
            const duration = (Date.now() - enteredAt.current) / 1000;
            
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
