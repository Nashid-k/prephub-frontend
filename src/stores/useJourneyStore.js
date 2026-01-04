import { create } from 'zustand';
import { db } from '../db';
import { migrateFromLocalStorage } from '../utils/migrateMetrics';
import { authAPI, journeyAPI } from '../services/api';

/**
 * Unified Journey Store (Liquid Data Version)
 * 
 * Uses Dexie.js (IndexedDB) for "Telegram-speed" persistence and offline support.
 * Updates UI optimistically (Zustand) while syncing to DB asynchronously.
 */
const useJourneyStore = create((set, get) => ({
    // Core state
    pathId: null,
    experienceLevel: null,
    goals: [],
    onboardingCompleted: false,
    onboardingCompletedAt: null,
    lastPathChange: null,

    // Journey data from AI
    journeyData: null,
    journeyLoading: false,

    // Onboarding flow state
    isOnboarding: false,
    onboardingStep: null,

    // System state
    isInitialized: false,

    // Initialization (Hydration from DB)
    init: async () => {
        if (get().isInitialized) return;

        try {
            // 1. Run migration if needed
            await migrateFromLocalStorage();

            // 2. Load from DB
            const journey = await db.journey.toArray(); // Should contain 0 or 1 item
            if (journey && journey.length > 0) {
                const state = journey[0];
                set({
                    pathId: state.pathId,
                    experienceLevel: state.experienceLevel,
                    goals: state.goals || [],
                    onboardingCompleted: state.onboardingCompleted || false,
                    onboardingCompletedAt: state.onboardingCompletedAt,
                    lastPathChange: state.lastPathChange,
                    isInitialized: true
                });
                console.log('[JourneyStore] Hydrated from IndexDB 💧');
            } else {
                set({ isInitialized: true });
                console.log('[JourneyStore] Initialized (Empty DB)');
            }
        } catch (err) {
            console.error('[JourneyStore] Failed to hydrate:', err);
            set({ isInitialized: true }); // recovered enough to run
        }
    },

    // Actions (Optimistic UI + DB Sync)
    setPath: async (pathId, experienceLevel) => {
        const currentPathId = get().pathId;
        const lastPathChange = pathId !== currentPathId ? new Date().toISOString() : get().lastPathChange;

        // 1. Optimistic Update
        set({
            pathId,
            experienceLevel,
            lastPathChange
        });

        // 2. DB Sync
        try {
            await db.journey.put({
                id: 1, // Singleton ID
                pathId,
                experienceLevel,
                goals: get().goals,
                onboardingCompleted: get().onboardingCompleted,
                onboardingCompletedAt: get().onboardingCompletedAt,
                lastPathChange
            });
        } catch (e) {
            console.error('[JourneyStore] DB Write Failed:', e);
        }
    },

    setGoals: async (goals) => {
        // 1. Optimistic
        set({ goals });

        // 2. DB Sync
        try {
            await db.journey.update(1, { goals });
        } catch (e) {
            // If it doesn't exist yet, we might need put
            const exists = await db.journey.get(1);
            if (!exists) {
                await db.journey.put({ id: 1, goals, pathId: get().pathId, experienceLevel: get().experienceLevel });
            }
        }
    },

    completeOnboarding: async (pathId, experienceLevel, goals = []) => {
        const timestamp = new Date().toISOString();

        // 1. Optimistic
        set({
            pathId,
            experienceLevel,
            goals,
            onboardingCompleted: true,
            onboardingCompletedAt: timestamp,
            isOnboarding: false,
            onboardingStep: null
        });

        // 2. DB Sync
        try {
            await db.journey.put({
                id: 1,
                pathId,
                experienceLevel,
                goals,
                onboardingCompleted: true,
                onboardingCompletedAt: timestamp,
                lastPathChange: get().lastPathChange || timestamp
            });
        } catch (e) {
            console.error('[JourneyStore] DB Write Failed:', e);
        }
    },

    startOnboarding: async () => {
        set({ isOnboarding: true, journeyLoading: true });
        try {
            const response = await journeyAPI.onboardStep({ step: 1 });
            set({ onboardingStep: response.data, journeyLoading: false });
        } catch (error) {
            console.error('Failed to start onboarding:', error);
            set({ journeyLoading: false });
        }
    },

    cancelOnboarding: () => {
        set({ isOnboarding: false, onboardingStep: null });
    },

    setJourneyData: (data) => set({ journeyData: data }),
    setJourneyLoading: (loading) => set({ journeyLoading: loading }),

    // Fetch journey data from AI
    fetchJourneyData: async (context = {}) => {
        set({ journeyLoading: true });
        try {
            const state = get();
            const response = await journeyAPI.getNextAction({
                pathId: state.pathId,
                previousPathId: state.lastPathChange ? state.pathId : null,
                ...context
            });
            set({ journeyData: response.data, journeyLoading: false });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch journey data:', error);
            set({ journeyLoading: false });
            return null;
        }
    },

    // Sync with server (for logged-in users)
    syncWithServer: async () => {
        try {
            const state = get();
            if (!state.pathId) return;

            await authAPI.updatePreferences({
                pathId: state.pathId,
                experienceLevel: state.experienceLevel,
                goals: state.goals,
                onboardingCompleted: state.onboardingCompleted
            });
        } catch (error) {
            console.error('Failed to sync preferences:', error);
        }
    },

    // Load from server (on login)
    loadFromServer: async (serverPreferences) => {
        if (serverPreferences?.pathId) {
            const newState = {
                pathId: serverPreferences.pathId,
                experienceLevel: serverPreferences.experienceLevel,
                goals: serverPreferences.goals || [],
                onboardingCompleted: serverPreferences.onboardingCompleted || false,
                onboardingCompletedAt: serverPreferences.onboardingCompletedAt,
                lastPathChange: serverPreferences.lastPathChange
            };

            // 1. Optimistic
            set(newState);

            // 2. DB Sync
            await db.journey.put({ id: 1, ...newState });
        }
    },

    // Reset state
    reset: async () => {
        set({
            pathId: null,
            experienceLevel: null,
            goals: [],
            onboardingCompleted: false,
            onboardingCompletedAt: null,
            lastPathChange: null,
            journeyData: null,
            isOnboarding: false,
            onboardingStep: null
        });
        await db.journey.clear();
    }
}));

export default useJourneyStore;
