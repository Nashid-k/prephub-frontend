import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress } from '@mui/material';
import { TrendingDown, School } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * Shows topics/sections that need review based on low completion
 * @param {Array} topics - Array of topics with completion data
 */
const WeakAreasCard = ({ topics = [] }) => {
    // Find topics with < 30% completion
    const weakTopics = topics
        .filter(t => t.percentage > 0 && t.percentage < 30)
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 5);

    // Find topics in progress but stalled (30-70%)
    const stalledTopics = topics
        .filter(t => t.percentage >= 30 && t.percentage < 70)
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3);

    if (weakTopics.length === 0 && stalledTopics.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <School sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Great Progress!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No weak areas identified. Keep up the excellent work! 🎉
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown sx={{ color: 'warning.main' }} />
                Areas Needing Review
            </Typography>

            {weakTopics.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Low Completion (&lt;30%)
                    </Typography>
                    {weakTopics.map((topic) => (
                        <Paper
                            key={topic.topicSlug}
                            component={Link}
                            to={topic.continueLink || `/topic/${topic.topicSlug}`}
                            sx={{
                                p: 2,
                                mb: 1,
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateX(4px)',
                                    boxShadow: 2,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {topic.topicName}
                                </Typography>
                                <Chip
                                    label={`${topic.percentage}%`}
                                    size="small"
                                    color="error"
                                    sx={{ minWidth: 50 }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={topic.percentage}
                                sx={{
                                    height: 6,
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: 'error.main',
                                    },
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {topic.completedSections} of {topic.totalSections} sections
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            )}

            {stalledTopics.length > 0 && (
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        In Progress (30-70%)
                    </Typography>
                    {stalledTopics.map((topic) => (
                        <Paper
                            key={topic.topicSlug}
                            component={Link}
                            to={topic.continueLink || `/topic/${topic.topicSlug}`}
                            sx={{
                                p: 2,
                                mb: 1,
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateX(4px)',
                                    boxShadow: 2,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {topic.topicName}
                                </Typography>
                                <Chip
                                    label={`${topic.percentage}%`}
                                    size="small"
                                    color="warning"
                                    sx={{ minWidth: 50 }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={topic.percentage}
                                sx={{
                                    height: 6,
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: 'warning.main',
                                    },
                                }}
                            />
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default React.memo(WeakAreasCard);
