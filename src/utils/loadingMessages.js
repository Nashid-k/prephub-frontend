// Helper to inject data into messages
export const processMessage = (message, data = {}) => {
    let processed = message;
    Object.keys(data).forEach(key => {
        processed = processed.replace(`{${key}}`, data[key] || 'module');
    });
    // Clean up any double spaces if replacement was empty
    return processed.replace(/\s+/g, ' ').trim();
};

export const getRandomTip = (category) => {
    const tips = messageCategories[category] || messageCategories.default;
    return tips[Math.floor(Math.random() * tips.length)];
};

export const getCategoryFromPath = (path) => {
    if (!path) return 'default';
    if (path.includes('/login') || path.includes('/register') || path === '/') return 'auth';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/topic/') && path.includes('/section/')) return 'practice';
    if (path.includes('/topic/') && path.includes('/category/')) return 'topic'; // Category page
    if (path.includes('/topic/')) return 'topic';
    if (path.includes('/reviews')) return 'review';
    if (path.includes('/progress')) return 'progress';
    if (path.includes('/dsa') || path.includes('/cs-fundamentals') || path.includes('/system-design')) return 'dashboard';
    return 'default';
};

const messageCategories = {
    auth: [
        "Securing your workspace...",
        "Authenticating session...",
        "Preparing personalized dashboard...",
        "Connecting to secure servers...",
        "Loading user profile..."
    ],
    dashboard: [
        "Analyzing learning progress...",
        "Updates daily stats...",
        "Calculating next best step...",
        "Syncing achievements...",
        "Preparing study plan..."
    ],
    topic: [
        "Structuring {topic} curriculum...",
        "Loading {topic} mastery data...",
        "Preparing key concepts...",
        "Organizing learning modules...",
        "Fetching {topic} resources..."
    ],
    practice: [
        "Booting up {topic} environment...",
        "Loading test cases...",
        "Connecting to AI tutor...",
        "Setting up coding playground...",
        "Optimizing compiler..."
    ],
    review: [
        "Calculating spaced repetition...",
        "Fetching due reviews...",
        "Analyzing retention...",
        "Preparing flashcards...",
        "Optimizing review queue..."
    ],
    progress: [
        "Crunching performance numbers...",
        "Generating insights...",
        "Visualizing learning journey...",
        "Calculating consistency...",
        "Analyzing metrics..."
    ],
    default: [
        "Loading PrepHub...",
        "Optimizing experience...",
        "Connecting to server...",
        "Preparing resources...",
        "Almost there..."
    ]
};

export default messageCategories;

