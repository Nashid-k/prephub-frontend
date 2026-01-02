import React from 'react';
import { Card, Box, Typography, IconButton, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Bookmark, BookmarkBorder } from '@mui/icons-material';

const CategoryCard = ({
    category,
    topic,
    index,
    isCompleted,
    isBookmarked,
    onToggleStatus,
    onToggleBookmark,
    onClick
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
        >
            <Card
                sx={{
                    borderRadius: '24px',
                    background: isDark
                        ? 'rgba(30, 30, 30, 0.4)'
                        : 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid',
                    borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.5)',
                    overflow: 'hidden',
                    boxShadow: isDark
                        ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                        : '0 10px 30px rgba(31, 38, 135, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 20px 40px ${topic.color}20`,
                        borderColor: `${topic.color}40`,
                        background: isDark
                            ? 'rgba(30, 30, 30, 0.6)'
                            : 'rgba(255, 255, 255, 0.8)',
                    },
                }}
            >
                <Box
                    onClick={onClick}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 2, sm: 3 },
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
                        }
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: topic.color,
                            opacity: 0.4,
                            minWidth: '40px',
                            fontFamily: 'monospace'
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </Typography>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                color: isCompleted ? 'text.secondary' : 'text.primary',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                            }}
                        >
                            {category.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {category.description || `${category.sectionCount || 0} Sections`}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={onToggleStatus}
                            sx={{
                                color: isCompleted ? '#30d158' : 'text.disabled',
                                bgcolor: isCompleted ? '#30d15815' : 'transparent',
                                border: '1px solid',
                                borderColor: isCompleted ? '#30d15840' : 'rgba(128,128,128,0.2)',
                                '&:hover': { bgcolor: '#30d15825', color: '#30d158' }
                            }}
                        >
                            <CheckCircle />
                        </IconButton>

                        <IconButton
                            onClick={onToggleBookmark}
                            sx={{
                                color: isBookmarked ? topic.color : 'text.disabled',
                                transition: 'all 0.2s',
                                '&:hover': { color: topic.color, transform: 'scale(1.1)' }
                            }}
                        >
                            {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                    </Box>
                </Box>
            </Card>
        </motion.div>
    );
};

// Strict Memoization
export default React.memo(CategoryCard, (prev, next) => {
    return (
        prev.category._id === next.category._id &&
        prev.isCompleted === next.isCompleted &&
        prev.isBookmarked === next.isBookmarked &&
        prev.index === next.index &&
        prev.topic.color === next.topic.color
    );
});
