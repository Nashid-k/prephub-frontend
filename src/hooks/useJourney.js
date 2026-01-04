import { useState, useEffect, useCallback } from 'react';
import { journeyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for AI-driven journey management
 * Handles:
 * - Fetching next-action recommendations
 * - Conversational onboarding flow
 * - Path switching detection
 */
export const useJourney = () => {
    const { user } = useAuth();
    const [journeyData, setJourneyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Onboarding state
    const [onboardingStep, setOnboardingStep] = useState(null);
    const [onboardingAnswers, setOnboardingAnswers] = useState({});
    const [isOnboarding, setIsOnboarding] = useState(false);

    /**
     * Fetch AI-driven next action recommendation
     */
    const fetchNextAction = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get stored path info
            const pathConfig = JSON.parse(localStorage.getItem('prephub_ai_path_config') || '{}');
            const previousPath = localStorage.getItem('prephub_previous_path');
            const lastVisit = localStorage.getItem('prephub_last_visit');

            const response = await journeyAPI.getNextAction({
                firstName: user?.name?.split(' ')[0] || null,
                pathId: pathConfig.pathId || null,
                previousPathId: previousPath,
                lastVisit: lastVisit,
                currentPage: 'home'
            });

            setJourneyData(response.data);

            // Update last visit
            localStorage.setItem('prephub_last_visit', new Date().toISOString());

            // Update previous path for next time
            if (pathConfig.pathId) {
                localStorage.setItem('prephub_previous_path', pathConfig.pathId);
            }

        } catch (err) {
            console.error('Failed to fetch journey data:', err);
            setError(err);
            // Set fallback data
            setJourneyData({
                greeting: `Hey there!`,
                message: "Ready to start your coding journey?",
                primaryAction: { label: 'Start Learning', suggestion: 'Pick a path' },
                secondaryAction: { label: 'Explore' },
                isFallback: true
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Start conversational onboarding
     */
    const startOnboarding = useCallback(async () => {
        try {
            setIsOnboarding(true);
            setOnboardingAnswers({});

            const response = await journeyAPI.onboardStep({ step: 1 });
            setOnboardingStep(response.data);
        } catch (err) {
            console.error('Failed to start onboarding:', err);
            setError(err);
        }
    }, []);

    /**
     * Answer an onboarding question and proceed
     */
    const answerOnboarding = useCallback(async (questionId, answerId) => {
        try {
            const newAnswers = { ...onboardingAnswers, [questionId]: answerId };
            setOnboardingAnswers(newAnswers);

            const nextStep = onboardingStep.step + 1;

            const response = await journeyAPI.onboardStep({
                step: nextStep,
                previousAnswers: newAnswers
            });

            setOnboardingStep(response.data);

            // If we got a recommendation (step 3), we're done with questions
            if (response.data.type === 'recommendation') {
                return response.data;
            }

            return response.data;
        } catch (err) {
            console.error('Failed to process onboarding answer:', err);
            setError(err);
            return null;
        }
    }, [onboardingStep, onboardingAnswers]);

    /**
     * Complete onboarding and save preferences
     */
    const completeOnboarding = useCallback(async (pathId) => {
        try {
            const sessionId = localStorage.getItem('prephub_session_id');

            await journeyAPI.completeOnboarding({
                sessionId,
                pathId,
                answers: onboardingAnswers
            });

            // Save to localStorage
            localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                pathId,
                experienceLevelId: onboardingAnswers.experience || '0-1_year'
            }));

            setIsOnboarding(false);
            setOnboardingStep(null);

            // Refresh journey data
            await fetchNextAction();

            return { success: true, pathId };
        } catch (err) {
            console.error('Failed to complete onboarding:', err);
            setError(err);
            return { success: false, error: err };
        }
    }, [onboardingAnswers, fetchNextAction]);

    /**
     * Cancel onboarding
     */
    const cancelOnboarding = useCallback(() => {
        setIsOnboarding(false);
        setOnboardingStep(null);
        setOnboardingAnswers({});
    }, []);

    // Fetch on mount and when user changes
    useEffect(() => {
        fetchNextAction();
    }, [fetchNextAction]);

    return {
        // Journey data
        journeyData,
        loading,
        error,
        refresh: fetchNextAction,

        // Onboarding
        isOnboarding,
        onboardingStep,
        startOnboarding,
        answerOnboarding,
        completeOnboarding,
        cancelOnboarding
    };
};

export default useJourney;
