/**
 * Spaced Repetition Algorithm (SM-2)
 * Based on SuperMemo SM-2 algorithm for optimal review scheduling
 * Research-backed to improve retention by 200%+
 */

/**
 * Calculate next review date and updated ease factor based on user's recall quality
 * @param {number} quality - User's recall quality (1-5): 1=complete failure, 5=perfect recall
 * @param {number} interval - Current interval in days
 * @param {number} easeFactor - Current ease factor (minimum 1.3)
 * @param {number} reviewCount - Number of times reviewed
 * @returns {Object} { nextReview: Date, interval: number, easeFactor: number }
 */
export const calculateNextReview = (quality, interval, easeFactor, reviewCount = 0) => {
    // Quality must be 1-5
    if (quality < 1 || quality > 5) {
        throw new Error('Quality must be between 1 and 5');
    }

    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Minimum ease factor is 1.3
    newEF = Math.max(1.3, newEF);

    let newInterval;
    let newReviewCount = reviewCount + 1;

    if (quality < 3) {
        // If recall was poor, reset to day 1
        newInterval = 1;
        newReviewCount = 0;
    } else {
        // Good recall - increase interval
        if (reviewCount === 0) {
            newInterval = 1; // First repetition: 1 day
        } else if (reviewCount === 1) {
            newInterval = 6; // Second repetition: 6 days
        } else {
            // Subsequent repetitions: multiply previous interval by ease factor
            newInterval = Math.round(interval * newEF);
        }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
        nextReview,
        interval: newInterval,
        easeFactor: newEF,
        reviewCount: newReviewCount
    };
};

/**
 * Get difficulty label for UI display
 * @param {number} quality - Rating 1-5
 * @returns {string} Difficulty label
 */
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

/**
 * Get color for difficulty rating
 * @param {number} quality - Rating 1-5
 * @returns {string} Color code
 */
export const getDifficultyColor = (quality) => {
    const colors = {
        1: '#ff453a', // Red
        2: '#ff9f0a', // Orange
        3: '#30d158', // Green
        4: '#0a84ff', // Blue
        5: '#5e5ce6'  // Purple
    };
    return colors[quality] || '#30d158';
};

/**
 * Check if a section is due for review
 * @param {Date} nextReview - Next scheduled review date
 * @returns {boolean} True if due for review
 */
export const isDueForReview = (nextReview) => {
    if (!nextReview) return false;
    return new Date() >= new Date(nextReview);
};

/**
 * Get sections due for review
 * @param {Array} sections - Array of sections with review data
 * @returns {Array} Sections due for review, sorted by next review date
 */
export const getDueReviews = (sections) => {
    return sections
        .filter(s => s.reviewData && isDueForReview(s.reviewData.nextReview))
        .sort((a, b) => new Date(a.reviewData.nextReview) - new Date(b.reviewData.nextReview));
};

/**
 * Initialize review data for a new section
 * @returns {Object} Initial review data
 */
export const initializeReviewData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
        nextReview: tomorrow,
        interval: 1,
        easeFactor: 2.5, // Default ease factor
        reviewCount: 0
    };
};
