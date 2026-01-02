import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

/**
 * Skeleton loader for content while lazy components load
 */
export const ContentSkeleton = () => (
    <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: '12px' }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '12px' }} />
    </Box>
);

/**
 * Skeleton loader for code editor
 */
export const EditorSkeleton = () => (
    <Box sx={{ p: 3, bgcolor: '#1e1e1e', borderRadius: '12px' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={12} height={12} sx={{ bgcolor: '#ff5f56' }} />
            <Skeleton variant="circular" width={12} height={12} sx={{ bgcolor: '#ffbd2e' }} />
            <Skeleton variant="circular" width={12} height={12} sx={{ bgcolor: '#27c93f' }} />
        </Box>
        {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
                key={i}
                variant="text"
                width={`${Math.random() * 40 + 40}%`}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }}
            />
        ))}
    </Box>
);

export default ContentSkeleton;
