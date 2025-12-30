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
            description: 'Topics mastered',
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
        <Box sx={{ minHeight: 'calc(100vh - 100px)', pb: 6 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.15) 0%, transparent 60%)'
                            : 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.08) 0%, transparent 60%)',
                    py: 8,
                    mb: 6,
                }}
            >
                <Container maxWidth="xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 3,
                                        borderRadius: '32px',
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                        mb: 3,
                                        boxShadow: '0 12px 40px rgba(94, 92, 230, 0.4)',
                                    }}
                                >
                                    <TrendingUp sx={{ fontSize: 48, color: 'white' }} />
                                </Box>
                            </motion.div>
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '3rem' },
                                }}
                            >
                                Your Learning Progress
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                                Track your journey through the MERN stack
                            </Typography>
                        </Box>

                        {/* Stats Grid */}
                        <Grid container spacing={3}>
                            {stats.map((stat, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Card
                                            sx={{
                                                height: '100%',
                                                borderRadius: '24px',
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
                                                boxShadow: `0 8px 32px ${stat.color}20`,
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                '&:hover': {
                                                    boxShadow: `0 16px 48px ${stat.color}40`,
                                                    borderColor: stat.color,
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: '16px',
                                                        background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '2px solid',
                                                        borderColor: `${stat.color}40`,
                                                        mb: 2,
                                                        color: stat.color,
                                                    }}
                                                >
                                                    {stat.icon}
                                                </Box>
                                                <Typography
                                                    variant="h3"
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 0.5,
                                                        color: stat.color,
                                                        fontSize: '2rem',
                                                    }}
                                                >
                                                    {stat.value}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'text.primary',
                                                        mb: 0.5,
                                                    }}
                                                >
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
                    </motion.div>
                </Container>
            </Box>

            {/* Languages Grid */}
            <Container maxWidth="xl">
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        📚 Language Progress
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track your mastery across different technologies
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {topics.map((topic, index) => {
                        const topicColor = getTopicColor(topic.topicSlug);
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.topicSlug}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    whileHover={{ y: -12 }}
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
                                                boxShadow: `0 24px 64px ${topicColor}40`,
                                                borderColor: topicColor,
                                                '& .topic-icon': {
                                                    transform: 'scale(1.15) rotate(5deg)',
                                                },
                                                '& .language-bg': {
                                                    transform: 'scale(1.2) rotate(-5deg)',
                                                    opacity: 0.25,
                                                },
                                            },
                                        }}
                                    >
                                        {/* Large Background Language Image */}
                                        <Box
                                            className="language-bg"
                                            sx={{
                                                position: 'absolute',
                                                top: -40,
                                                right: -40,
                                                width: '200px',
                                                height: '200px',
                                                opacity: 0.12,
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
                                                    filter: isDark ? 'brightness(0.6)' : 'brightness(1.3)',
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </Box>

                                        {/* Gradient Background Accent */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '200px',
                                                background: `linear-gradient(135deg, ${topicColor}15 0%, transparent 100%)`,
                                                opacity: 0.6,
                                                pointerEvents: 'none',
                                            }}
                                        />

                                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
                                            {/* Icon */}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                                <Box
                                                    className="topic-icon"
                                                    sx={{
                                                        width: 96,
                                                        height: 96,
                                                        borderRadius: '28px',
                                                        background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '2px solid',
                                                        borderColor: `${topicColor}40`,
                                                        boxShadow: `0 8px 32px ${topicColor}30`,
                                                        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                    }}
                                                >
                                                    <img
                                                        src={getTopicImage(topic.topicSlug)}
                                                        alt={topic.topicSlug}
                                                        style={{
                                                            width: '60%',
                                                            height: '60%',
                                                            objectFit: 'contain',
                                                        }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* Title */}
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography
                                                    variant="h5"
                                                    component="h3"
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 1,
                                                        color: topicColor,
                                                    }}
                                                >
                                                    {topic.topicSlug}
                                                </Typography>
                                            </Box>

                                            {/* Stats */}
                                            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <Chip
                                                    icon={<MenuBook sx={{ fontSize: 16 }} />}
                                                    label={`${topic.completedSections}/${topic.totalSections} Chapters`}
                                                    size="small"
                                                    sx={{
                                                        borderRadius: '9999px',
                                                        fontWeight: 600,
                                                        bgcolor: 'action.hover',
                                                        fontSize: '0.8rem',
                                                    }}
                                                />
                                                {topic.percentage === 100 && (
                                                    <Chip
                                                        icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                                        label="Completed"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '9999px',
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            bgcolor: '#30d15820',
                                                            color: '#30d158',
                                                            border: '2px solid #30d15840',
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Progress Bar */}
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Progress
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 700, color: topicColor }}>
                                                        {topic.percentage}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={topic.percentage}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: '9999px',
                                                        bgcolor: (theme) =>
                                                            theme.palette.mode === 'dark'
                                                                ? 'rgba(255, 255, 255, 0.08)'
                                                                : 'rgba(0, 0, 0, 0.06)',
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: '9999px',
                                                            background: `linear-gradient(90deg, ${topicColor} 0%, ${topicColor}CC 100%)`,
                                                            boxShadow: `0 2px 8px ${topicColor}40`,
                                                        },
                                                    }}
                                                />
                                            </Box>
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
