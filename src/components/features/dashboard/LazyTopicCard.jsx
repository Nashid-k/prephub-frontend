import { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import TopicCard from './TopicCard';

/**
 * LazyTopicCard - Wrapper that uses Intersection Observer to lazy-load TopicCards
 * Only renders the actual TopicCard when it's about to become visible
 */
export default function LazyTopicCard({ topic, index, reduced, customLink }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        // Create intersection observer
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Disconnect once visible to prevent further checks
                    observer.disconnect();
                }
            },
            {
                // Start loading slightly before the card enters viewport
                rootMargin: '200px',
                threshold: 0
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, []);

    return (
        <Box ref={ref} sx={{ display: 'flex', height: 'auto', minHeight: '200px' }}>
            {isVisible ? (
                <TopicCard
                    topic={topic}
                    reduced={reduced}
                    customLink={customLink}
                />
            ) : (
                // Skeleton placeholder while card is not in viewport
                <Skeleton
                    variant="rounded"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: '24px' }}
                />
            )}
        </Box>
    );
}
