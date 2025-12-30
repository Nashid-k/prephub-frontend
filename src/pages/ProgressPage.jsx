import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    useTheme,
    Paper,
    Divider,
} from '@mui/material';
import {
    TrendingUp,
    CheckCircle,
    MenuBook,
    EmojiEvents,
    LocalFireDepartment,
    Timeline,
} from '@mui/icons-material';
import { progressAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import { getStreakData } from '../utils/streakTracker';
import StudyHeatmap from '../components/analytics/StudyHeatmap';
import TimeSpentChart from '../components/analytics/TimeSpentChart';
import WeakAreasCard from '../components/analytics/WeakAreasCard';

const ProgressPage = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        // 1. Load from cache first for instant UI
        const cachedProgress = localStorage.getItem('prephub_global_progress');
        if (cachedProgress) {
            try {
                setTopics(JSON.parse(cachedProgress));
                setLoading(false);
            } catch (e) {
                console.error('Failed to parse cached progress');
            }
        }

        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            if (!localStorage.getItem('prephub_global_progress')) {
                setLoading(true);
            }

            const response = await progressAPI.getAllProgress();
            const newTopics = response.data.topics;

            setTopics(newTopics);
            // 2. Save to cache
            localStorage.setItem('prephub_global_progress', JSON.stringify(newTopics));
        } catch (err) {
            console.error('Error fetching global progress:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate interesting stats
    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.percentage === 100).length;
    const inProgressTopics = topics.filter(t => t.percentage > 0 && t.percentage < 100).length;
    const totalSections = topics.reduce((sum, t) => sum + t.totalSections, 0);
    const completedSections = topics.reduce((sum, t) => sum + t.completedSections, 0);
    const overallProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    // Get streak data for heatmap
    const streakData = getStreakData();
    const studyDates = streakData.studyDates || [];

    // Prepare data for TimeSpentChart
    const topicsForChart = topics
        .filter(t => t.timeSpent > 0)
        .map(t => ({
            name: t.topicName,
            timeSpent: t.timeSpent || 0
        }));

    const stats = [
        {
            icon: <Timeline sx={{ fontSize: 32 }} />,
            label: 'Overall Progress',
            value: `${overallProgress}%`,
            color: '#5e5ce6',
            description: `${completedSections} of ${totalSections} chapters`,
        },
        {
            icon: <CheckCircle sx={{ fontSize: 32 }} />,
            label: 'Completed Topics',
            value: completedTopics,
            color: '#30d158',
            description: `${completedTopics} of ${totalTopics} topics`,
        },
        {
            icon: <LocalFireDepartment sx={{ fontSize: 32 }} />,
            label: 'Active Topics',
            value: inProgressTopics,
            color: '#ff9f0a',
            description: 'Currently learning',
        },
        {
            icon: <EmojiEvents sx={{ fontSize: 32 }} />,
            label: 'Completion Rate',
            value: totalTopics > 0 ? `${Math.round((completedTopics / totalTopics) * 100)}%` : '0%',
            color: '#ff375f',
            description: 'Topics fully completed',
        },
    ];

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl">
                    <LoadingSpinner message="Loading your progress..." />
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', py: 6 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(94, 92, 230, 0.3)',
                            }}
                        >
                            <TrendingUp sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Your Progress
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400 }}>
                            Track your learning journey
                        </Typography>
                    </Box>
                </motion.div>

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    sx={{
                                        background: isDark
                                            ? 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)'
                                            : 'linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%)',
                                        borderRadius: 3,
                                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: `${stat.color}20`,
                                                    color: stat.color,
                                                }}
                                            >
                                                {stat.icon}
                                            </Box>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {stat.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Analytics Section */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {/* Study Heatmap */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <StudyHeatmap studyDates={studyDates} />
                        </Paper>
                    </Grid>

                    {/* Weak Areas */}
                    <Grid item xs={12} md={4}>
                        <WeakAreasCard topics={topics} />
                    </Grid>

                    {/* Time Spent Chart */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <TimeSpentChart topics={topicsForChart} />
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 6 }} />

                {/* Topics Progress List */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Topic Progress
                </Typography>

                <Grid container spacing={3}>
                    {topics.map((topic, index) => (
                        <Grid item xs={12} sm={6} md={4} key={topic.topicSlug}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                            >
                                <Card
                                    component={Link}
                                    to={topic.continueLink || `/topic/${topic.topicSlug}`}
                                    sx={{
                                        textDecoration: 'none',
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        borderRadius: 3,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {topic.topicName}
                                            </Typography>
                                            <Chip
                                                label={`${topic.percentage}%`}
                                                size="small"
                                                color={topic.percentage === 100 ? 'success' : topic.percentage > 0 ? 'primary' : 'default'}
                                            />
                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={topic.percentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                mb: 2,
                                                bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': {
                                                    background: getTopicColor(topic.topicSlug),
                                                },
                                            }}
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {topic.completedSections}/{topic.totalSections} sections
                                            </Typography>
                                            {topic.percentage < 100 && (
                                                <Typography variant="caption" sx={{ color: 'primary.main' }}>
                                                    Continue →
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default ProgressPage;
