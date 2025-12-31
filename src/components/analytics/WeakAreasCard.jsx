import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, useTheme, Grid } from '@mui/material';
import { TrendingDown, School, AutoStories } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getTopicColor } from '../../utils/topicMetadata';

/**
 * Shows topics/sections that need review based on low completion
 * @param {Array} topics - Array of topics with completion data
 */
const WeakAreasCard = ({ topics = [] }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

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
            <Paper sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '24px',
                background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                boxShadow: isDark
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #30d158 0%, #32d74b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(48, 209, 88, 0.3)',
                    }}
                >
                    <School sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                    Great Progress!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    No weak areas identified. Keep up the excellent work! 🎉
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{
            p: 4,
            borderRadius: '24px',
            background: isDark
                ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.4) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            boxShadow: isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff9f0a20 0%, #ff9f0a10 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: '#ff9f0a30',
                    }}
                >
                    <AutoStories sx={{ color: '#ff9f0a', fontSize: 24 }} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Areas to Focus On
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Topics that need more attention
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {weakTopics.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Low Completion (&lt;30%)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {weakTopics.map((topic) => {
                                const topicColor = getTopicColor(topic.topicSlug, isDark);
                                return (
                                    <Paper
                                        key={topic.topicSlug}
                                        component={Link}
                                        to={topic.continueLink || `/topic/${topic.topicSlug}`}
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            textDecoration: 'none',
                                            display: 'block',
                                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                            borderRadius: '16px',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                borderColor: '#ff375f50',
                                                boxShadow: '0 8px 24px rgba(255, 55, 95, 0.15)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {topic.topicName}
                                            </Typography>
                                            <Chip
                                                label={`${topic.percentage}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#ff375f20',
                                                    color: '#ff375f',
                                                    fontWeight: 700,
                                                    minWidth: 60,
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={topic.percentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: '9999px',
                                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: '9999px',
                                                    background: 'linear-gradient(90deg, #ff375f 0%, #ff2d55 100%)',
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
                                            {topic.completedSections} of {topic.totalSections} sections completed
                                        </Typography>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Grid>
                )}

                {stalledTopics.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            In Progress (30-70%)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {stalledTopics.map((topic) => {
                                const topicColor = getTopicColor(topic.topicSlug, isDark);
                                return (
                                    <Paper
                                        key={topic.topicSlug}
                                        component={Link}
                                        to={topic.continueLink || `/topic/${topic.topicSlug}`}
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            textDecoration: 'none',
                                            display: 'block',
                                            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                            borderRadius: '16px',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                borderColor: '#ff9f0a50',
                                                boxShadow: '0 8px 24px rgba(255, 159, 10, 0.15)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {topic.topicName}
                                            </Typography>
                                            <Chip
                                                label={`${topic.percentage}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#ff9f0a20',
                                                    color: '#ff9f0a',
                                                    fontWeight: 700,
                                                    minWidth: 60,
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={topic.percentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: '9999px',
                                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: '9999px',
                                                    background: 'linear-gradient(90deg, #ff9f0a 0%, #ff9500 100%)',
                                                },
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
                                            {topic.completedSections} of {topic.totalSections} sections completed
                                        </Typography>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default React.memo(WeakAreasCard);
