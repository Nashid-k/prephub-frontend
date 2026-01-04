import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
    }
};

export const trackPageView = (path) => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.send({ hitType: 'pageview', page: path });
    }
};

export const trackEvent = (category, action, label = '', value = 0) => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.event({
            category,
            action,
            label,
            value,
        });
    }
};

export const trackCodeExecution = (language) => {
    trackEvent('Compiler', 'Execute Code', language);
};

export const trackAIExplanation = (topic, section) => {
    trackEvent('AI', 'Request Explanation', `${topic} - ${section}`);
};

export const trackTopicStart = (topic) => {
    trackEvent('Learning', 'Start Topic', topic);
};

export const trackProgressToggle = (topic, section, completed) => {
    trackEvent('Progress', completed ? 'Mark Completed' : 'Mark Incomplete', `${topic} - ${section}`);
};
