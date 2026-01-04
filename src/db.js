import Dexie from 'dexie';

export class PrepHubDatabase extends Dexie {
    constructor() {
        super('prephub_db');

        // Define tables and indexes
        this.version(1).stores({
            // Singleton store for user journey/preferences
            // We'll typically just have one row with id=1
            journey: '++id, pathId, experienceLevel',

            // Bookmarks (Replacing localStorage)
            bookmarks: 'id, type, title, topicSlug, categorySlug',

            // Progress (Replacing complex object in localStorage)
            // Composite index [topicSlug+sectionSlug] for fast lookups
            progress: '[topicSlug+sectionSlug], topicSlug, sectionSlug, completedAt'
        });

        // Version 2: Add offline content
        this.version(2).stores({
            offline_content: 'slug, updatedAt' // storing the full JSON in the object
        });

        // Define tables for type safety (optional but good practice)
        this.journey = this.table('journey');
        this.bookmarks = this.table('bookmarks');
        this.progress = this.table('progress');
        this.offline_content = this.table('offline_content');
    }
}

export const db = new PrepHubDatabase();
