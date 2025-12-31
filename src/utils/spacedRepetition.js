export const calculateNextReview = (quality, interval, easeFactor, reviewCount = 0) => {
    if (quality < 1 || quality > 5) {
        throw new Error('Quality must be between 1 and 5');
    }

    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEF = Math.max(1.3, newEF);

    let newInterval;
    let newReviewCount = reviewCount + 1;

    if (quality < 3) {
        newInterval = 1;
        newReviewCount = 0;
    } else {
        if (reviewCount === 0) {
            newInterval = 1;
        } else if (reviewCount === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEF);
        }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
        nextReview,
        interval: newInterval,
        easeFactor: newEF,
        reviewCount: newReviewCount
    };
};

export const getDifficultyLabel = (quality) => {
    const labels = {
        1: 'Again',
        2: 'Hard',
        3: 'Good',
        4: 'Easy',
        5: 'Perfect'
    };
    return labels[quality] || 'Good';
};

export const getDifficultyColor = (quality) => {
    const colors = {
        1: '#ff453a',
        2: '#ff9f0a',
        3: '#30d158',
        4: '#0a84ff',
        5: '#5e5ce6'
    };
    return colors[quality] || '#30d158';
};

export const isDueForReview = (nextReview) => {
    if (!nextReview) return false;
    return new Date() >= new Date(nextReview);
};

export const getDueReviews = (sections) => {
    return sections
        .filter(s => s.reviewData && isDueForReview(s.reviewData.nextReview))
        .sort((a, b) => new Date(a.reviewData.nextReview) - new Date(b.reviewData.nextReview));
};

export const initializeReviewData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
        nextReview: tomorrow,
        interval: 1,
        easeFactor: 2.5,
        reviewCount: 0
    };
};
