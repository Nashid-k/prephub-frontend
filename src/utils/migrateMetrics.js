import { db } from '../db';
import toast from 'react-hot-toast';

export const migrateFromLocalStorage = async () => {
    try {
        const MIGRATION_KEY = 'prephub_db_migrated_v1';
        if (localStorage.getItem(MIGRATION_KEY)) {
            return; // Already migrated
        }

        console.log('[Migration] Starting localStorage -> IndexedDB migration...');

        await db.transaction('rw', db.journey, db.bookmarks, db.progress, async () => {

            // 1. Migrate Journey Config
            const journeyConfigStr = localStorage.getItem('prephub_ai_path_config');
            if (journeyConfigStr) {
                try {
                    const config = JSON.parse(journeyConfigStr);
                    // Check if already exists to avoid duplicates (though check above handles this mostly)
                    const count = await db.journey.count();
                    if (count === 0) {
                        await db.journey.add({
                            pathId: config.pathId,
                            experienceLevel: config.experienceLevelId, // Note name mapping if needed
                            goals: config.goals || [],
                            onboardingCompleted: config.onboardingCompleted || false,
                            onboardingCompletedAt: new Date().toISOString(), // approximate if missing
                            lastPathChange: new Date().toISOString()
                        });
                        console.log('[Migration] Journey config migrated.');
                    }
                } catch (e) {
                    console.error('[Migration] Failed to migrate journey config', e);
                }
            }

            // 2. Migrate Bookmarks
            const bookmarksStr = localStorage.getItem('prephub_bookmarks');
            if (bookmarksStr) {
                try {
                    const bookmarks = JSON.parse(bookmarksStr);
                    if (Array.isArray(bookmarks)) {
                        // Bulk put is faster
                        await db.bookmarks.bulkPut(bookmarks);
                        console.log(`[Migration] ${bookmarks.length} bookmarks migrated.`);
                    }
                } catch (e) {
                    console.error('[Migration] Failed to migrate bookmarks', e);
                }
            }

            // 3. Migrate Progress
            // Only migrating local optimistic progress might be tricky if structure differs.
            // Assuming we trust the API for truth, but for offline-first, let's look at what we have.
            // Usually progress is fetched from API, but if we had a local cache...
            // For now, we'll skip complex progress migration as it's primarily server-synced.
        });

        // Mark as done
        localStorage.setItem(MIGRATION_KEY, 'true');
        console.log('[Migration] Migration complete.');
        // toast.success('Database upgraded for offline support!');

    } catch (error) {
        console.error('[Migration] Critical failure:', error);
    }
};
