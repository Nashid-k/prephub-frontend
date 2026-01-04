/**
 * Migration utility for legacy localStorage keys
 * 
 * Migrates data from old scattered localStorage keys to the new Zustand store:
 * - prephub_ai_path_config
 * - prephub_onboarding
 * - prephub_previous_path
 * 
 * Run this once on app load to migrate existing users.
 */
export const migrateJourneyData = () => {
    try {
        // Check if migration already done
        const migrationDone = localStorage.getItem('prephub_journey_migrated');
        if (migrationDone) return null;

        let migrated = {};

        // Migrate from prephub_ai_path_config
        const pathConfig = localStorage.getItem('prephub_ai_path_config');
        if (pathConfig) {
            try {
                const parsed = JSON.parse(pathConfig);
                migrated.pathId = parsed.pathId;
                migrated.experienceLevel = parsed.experienceLevelId;
            } catch (e) {
                console.warn('Failed to parse path config:', e);
            }
        }

        // Migrate from prephub_onboarding
        const onboarding = localStorage.getItem('prephub_onboarding');
        if (onboarding) {
            try {
                const parsed = JSON.parse(onboarding);
                if (!migrated.experienceLevel && parsed.level) {
                    migrated.experienceLevel = parsed.level;
                }
                if (parsed.role) {
                    migrated.role = parsed.role;
                }
            } catch (e) {
                console.warn('Failed to parse onboarding data:', e);
            }
        }

        // Mark migration as complete
        if (Object.keys(migrated).length > 0) {
            localStorage.setItem('prephub_journey_migrated', 'true');
            return migrated;
        }

        return null;
    } catch (error) {
        console.error('Journey migration failed:', error);
        return null;
    }
};

/**
 * Clean up legacy localStorage keys after successful migration
 */
export const cleanupLegacyStorage = () => {
    const legacyKeys = [
        'prephub_ai_path_config',
        'prephub_onboarding',
        'prephub_previous_path'
    ];

    legacyKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // Ignore
        }
    });
};
