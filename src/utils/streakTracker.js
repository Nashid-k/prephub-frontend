const STORAGE_KEY = 'prephub_streak';

export const getStreakData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return initializeStreak();
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error reading streak data:', error);
        return initializeStreak();
    }
};

const initializeStreak = () => {
    const today = new Date().toDateString();
    const data = {
        currentStreak: 1,
        longestStreak: 1,
        lastVisit: today,
        studyDates: [today],
        totalDays: 1
    };
    saveStreakData(data);
    return data;
};

export const updateStreak = () => {
    const data = getStreakData();
    const today = new Date().toDateString();
    const lastVisit = data.lastVisit;

    if (lastVisit === today) {
        return data;
    }

    const lastVisitDate = new Date(lastVisit);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate - lastVisitDate) / (1000 * 60 * 60 * 24));

    let updatedData;

    if (daysDiff === 1) {
        updatedData = {
            ...data,
            currentStreak: data.currentStreak + 1,
            longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
            lastVisit: today,
            studyDates: [...data.studyDates, today],
            totalDays: data.totalDays + 1
        };
    } else if (daysDiff > 1) {
        updatedData = {
            ...data,
            currentStreak: 1,
            lastVisit: today,
            studyDates: [...data.studyDates, today],
            totalDays: data.totalDays + 1
        };
    } else {
        return data;
    }

    saveStreakData(updatedData);
    return updatedData;
};

export const saveStreakData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving streak data:', error);
    }
};

export const resetStreak = () => {
    localStorage.removeItem(STORAGE_KEY);
    return initializeStreak();
};

export const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🔥💯';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '✨';
};

export const getStreakMessage = (streak) => {
    if (streak >= 30) return 'Legendary streak!';
    if (streak >= 14) return 'Amazing consistency!';
    if (streak >= 7) return 'Week streak!';
    if (streak >= 3) return 'Great start!';
    return 'Keep it up!';
};
