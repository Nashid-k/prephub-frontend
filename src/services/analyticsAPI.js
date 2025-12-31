import api from './api';

export const trackActivity = async (activityData) => {
    try {
        const response = await api.post('/activity/track', activityData);
        return response.data;
    } catch (error) {
        console.error('Error tracking activity:', error);
        return null;
    }
};

export const getActivitySummary = async (days = 7) => {
    try {
        const response = await api.get(`/activity/summary?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('Error getting activity summary:', error);
        return null;
    }
};

export default {
    trackActivity,
    getActivitySummary
};
