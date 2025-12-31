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
    Button,
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
        <Box sx={{ minHeight: 'calc(100vh - 100px)', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.15) 0%, transparent 60%)'
                            : 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.08) 0%, transparent 60%)',
                    py: { xs: 6, md: 8 },
                    mb: { xs: 4, md: 6 },
                }}
            >
                <Container maxWidth="xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 2,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                    mb: 3,
                                    boxShadow: '0 8px 32px rgba(94, 92, 230, 0.3)',
                                }}
                            >
                                <TrendingUp sx={{ fontSize: 48, color: 'white' }} />
                            </Box>
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '3.5rem' },
                                }}
                            >
                                Your Progress
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
                                Track your learning journey across all topics and visualize your achievements.
                            </Typography>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="xl">
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
                                            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.4) 100%)'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '24px',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid',
                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                                        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
                                        height: '100%',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: '16px',
                                                    background: `${stat.color}20`,
                                                    color: stat.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 56,
                                                    height: 56,
                                                }}
                                            >
                                                {stat.icon}
                                            </Box>
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Analytics Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Analytics</Typography>
                    <Grid container spacing={3}>
                        {/* Study Heatmap - Full Width for Better Visibility */}
                        <Grid item xs={12}>
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
                                <StudyHeatmap studyDates={studyDates} />
                            </Paper>
                        </Grid>

                        {/* Weak Areas - Full Width for Better Content Display */}
                        <Grid item xs={12}>
                            <WeakAreasCard topics={topics} />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 6, opacity: 0.1 }} />

                {/* Topics Progress List */}
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                    Detailed Progress
                </Typography>

                <Grid container spacing={3}>
                    {topics
                        .filter(topic => topic.percentage > 0) // Only show topics with progress
                        .map((topic, index) => {
                            const topicColor = getTopicColor(topic.topicSlug, isDark);
                            const progress = topic.percentage || 0;
                            return (
                                <Grid item xs={12} sm={6} md={4} key={topic.topicSlug}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card
                                            component={Link}
                                            to={topic.continueLink || `/topic/${topic.topicSlug}`}
                                            sx={{
                                                textDecoration: 'none',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: '32px',
                                                background: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
                                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid',
                                                borderColor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.08)'
                                                        : 'rgba(0, 0, 0, 0.06)',
                                                boxShadow: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                        : '0 8px 32px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: `0 24px 64px ${topicColor}40`,
                                                    borderColor: topicColor,
                                                    '& .progress-bg-image': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        opacity: 0.15,
                                                    }
                                                },
                                            }}
                                        >
                                            {/* Background Image */}
                                            <Box
                                                className="progress-bg-image"
                                                sx={{
                                                    position: 'absolute',
                                                    top: -20,
                                                    right: -20,
                                                    width: '200px',
                                                    height: '200px',
                                                    opacity: 0.05,
                                                    transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                    pointerEvents: 'none',
                                                    zIndex: 0,
                                                }}
                                            >
                                                <img
                                                    src={getTopicImage(topic.topicSlug)}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        filter: isDark ? 'brightness(0.7)' : 'grayscale(100%)',
                                                    }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </Box>

                                            {/* Gradient Accent */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '120px',
                                                    background: `linear-gradient(135deg, ${topicColor}10 0%, transparent 100%)`,
                                                    opacity: 0.6,
                                                    pointerEvents: 'none',
                                                }}
                                            />

                                            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', position: 'relative', zIndex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '16px',
                                                            background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid',
                                                            borderColor: `${topicColor}30`,
                                                        }}
                                                    >
                                                        <img
                                                            src={getTopicImage(topic.topicSlug)}
                                                            alt={topic.topicName}
                                                            style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    </Box>
                                                    <Chip
                                                        label={progress === 100 ? 'Completed' : 'In Progress'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: progress === 100 ? 'success.light' : `${topicColor}20`,
                                                            color: progress === 100 ? 'success.dark' : topicColor,
                                                            fontWeight: 700,
                                                            borderRadius: '8px',
                                                            height: 28,
                                                        }}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                                        {topic.topicName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {topic.completedSections} of {topic.totalSections} sections completed
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ mt: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Progress</Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: topicColor }}>{progress}%</Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 10,
                                                            borderRadius: '9999px',
                                                            bgcolor: (theme) => isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: '9999px',
                                                                background: `linear-gradient(90deg, ${topicColor} 0%, ${topicColor}cc 100%)`,
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                {progress < 100 ? (
                                                    <Button
                                                        variant="text"
                                                        endIcon={<CheckCircle />}
                                                        sx={{
                                                            mt: 'auto',
                                                            justifyContent: 'flex-start',
                                                            p: 0,
                                                            color: topicColor,
                                                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        Continue Learning
                                                    </Button>
                                                ) : (
                                                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                                                        <CheckCircle fontSize="small" />
                                                        <Typography variant="body2" fontWeight={600}>Topic Mastered</Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                </Grid>
            </Container>
        </Box>
    );
};

export default ProgressPage;
