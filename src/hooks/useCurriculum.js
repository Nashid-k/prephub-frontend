import { useQuery } from '@tanstack/react-query';
import { curriculumAPI } from '../services/api';

/**
 * Hook to fetch topics with caching based on experience level
 * @param {Object} params - { experienceLevel, isPersonalized }
 */
export const useTopics = ({ experienceLevel, isPersonalized }) => {
    return useQuery({
        queryKey: ['topics', { experienceLevel, isPersonalized }],
        queryFn: async () => {
            const params = { experienceLevel };
            const response = isPersonalized
                ? await curriculumAPI.getPersonalizedTopics(params)
                : await curriculumAPI.getAllTopics(params);
            
            // Return the data directly for easier usage
            return response.data; // Expecting { success: true, topics: [], ... }
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache for topic list
        keepPreviousData: true, // Keep showing old list while fetching new one
    });
};

/**
 * Hook to fetch a single topic by slug
 */
export const useTopic = (slug) => {
    return useQuery({
        queryKey: ['topic', slug],
        queryFn: async () => {
            const response = await curriculumAPI.getTopicBySlug(slug);
            return response.data;
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 30, // 30 mins
    });
};

/**
 * Hook to fetch section content
 */
export const useSection = (topicSlug, sectionSlug) => {
    return useQuery({
        queryKey: ['section', topicSlug, sectionSlug],
        queryFn: async () => {
            const response = await curriculumAPI.getSectionBySlug(topicSlug, sectionSlug);
            return response.data;
        },
        enabled: !!topicSlug && !!sectionSlug,
        staleTime: 1000 * 60 * 60, // 1 hour cache for static content
    });
};

/**
 * Hook to fetch aggregated section data (Topic + Category + Section + Siblings)
 */
export const useSectionAggregate = (topicSlug, sectionSlug) => {
    return useQuery({
        queryKey: ['section-aggregate', topicSlug, sectionSlug],
        queryFn: async () => {
            const response = await curriculumAPI.getSectionAggregate(topicSlug, sectionSlug);
            return response.data;
        },
        enabled: !!topicSlug && !!sectionSlug,
        staleTime: 1000 * 60 * 60, // 1 hour
        keepPreviousData: true,
    });
};
