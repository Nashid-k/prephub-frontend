import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    useTheme,
} from '@mui/material';
import {
    Psychology,
    Code,
    GpsFixed,
    TrendingUp,
    ArrowForward,
    Bookmark,
    RocketLaunch,
    Terminal,
    School,
    PlayArrow,
    CheckCircle,
    MenuBook,
} from '@mui/icons-material';
import { progressAPI } from '../services/api';
import { getBookmarks } from '../utils/bookmarks';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import './Home.css';

import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [progress, setProgress] = useState(null);
    const [recentBookmarks, setRecentBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    // progress stats hook...

    useEffect(() => {
        const fetchData = async () => {
            try {
                const progressRes = await progressAPI.getAllProgress();
                const progressData = progressRes.data;

                const activeTopic = progressData.topics.find(t => t.percentage > 0 && t.percentage < 100)
                    || progressData.topics.find(t => t.percentage > 0)
                    || null;

                setProgress({
                    totalTopics: progressData.totalTopics,
                    activeTopic: activeTopic
                });

                const bookmarks = getBookmarks();
                setRecentBookmarks(bookmarks.slice(0, 3));

            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const hasActivity = progress?.activeTopic || recentBookmarks.length > 0;

    const features = [
        {
            icon: <Psychology sx={{ fontSize: 48 }} />,
            title: 'AI-Powered Learning',
            description: 'Get detailed explanations with code examples powered by Gemini AI',
            color: '#5e5ce6',
        },
        {
            icon: <Code sx={{ fontSize: 48 }} />,
            title: 'Online Compiler',
            description: 'Practice coding in 40+ languages with instant execution',
            color: '#5ac8fa',
        },
        {
            icon: <GpsFixed sx={{ fontSize: 48 }} />,
            title: 'Blind 75 Problems',
            description: 'Master the most important LeetCode problems',
            color: '#30d158',
        },
        {
            icon: <TrendingUp sx={{ fontSize: 48 }} />,
            title: 'Smart Progress',
            description: 'Track your mastery with detailed analytics',
            color: '#ff9f0a',
        },
    ];

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    minHeight: hasActivity ? '50vh' : '70vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Gradient Background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.15) 0%, transparent 60%)'
                                : 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.08) 0%, transparent 60%)',
                        pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            {/* Icon */}
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
                                        mb: 4,
                                        boxShadow: '0 12px 40px rgba(94, 92, 230, 0.5)',
                                    }}
                                >
                                    <School sx={{ fontSize: 64, color: 'white' }} />
                                </Box>
                            </motion.div>

                            {/* Title */}
                            {hasActivity && user ? (
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    }}
                                >
                                    Welcome back,{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {user.name?.split(' ')[0]}
                                    </Box>{' '}
                                    👋
                                </Typography>
                            ) : (
                                <Typography
                                    variant="h1"
                                    component="h1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '2.5rem', md: '4rem' },
                                        mb: 3,
                                    }}
                                >
                                    Master the{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Art of Code
                                    </Box>
                                </Typography>
                            )}

                            <Typography
                                variant="h5"
                                color="text.secondary"
                                sx={{ mb: 5, maxWidth: '700px', mx: 'auto', fontWeight: 400 }}
                            >
                                {hasActivity
                                    ? 'Continue where you left off'
                                    : 'Your comprehensive learning platform. Master multiple technologies with AI-powered guidance, practice coding, and ace technical interviews.'}
                            </Typography>

                            {/* CTA Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        component={Link}
                                        to="/dashboard"
                                        variant="contained"
                                        size="large"
                                        startIcon={<RocketLaunch />}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                            boxShadow: '0 8px 24px rgba(94, 92, 230, 0.5)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #d070ff 0%, #b865ff 100%)',
                                                boxShadow: '0 12px 32px rgba(94, 92, 230, 0.6)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        {hasActivity ? 'Continue Learning' : 'Start Learning'}
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        component={Link}
                                        to="/compiler"
                                        variant="outlined"
                                        size="large"
                                        startIcon={<Terminal />}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            borderWidth: '2px',
                                            borderColor: '#5e5ce6',
                                            color: '#5e5ce6',
                                            '&:hover': {
                                                borderWidth: '2px',
                                                borderColor: '#5e5ce6',
                                                background: 'rgba(94, 92, 230, 0.1)',
                                            },
                                            transition: 'all 0.3s',
                                        }}
                                    >
                                        Try Compiler
                                    </Button>
                                </motion.div>
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Activity Section (for logged-in users) */}
            {hasActivity && (
                <Container maxWidth="xl" sx={{ py: 6 }}>
                    <Grid container spacing={3}>
                        {/* Continue Learning Card */}
                        {progress?.activeTopic && (() => {
                            const topicColor = getTopicColor(progress.activeTopic.topicSlug, isDark);

                            return (
                                <Grid item xs={12} md={6}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -12 }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card
                                            component={Link}
                                            to={progress.activeTopic.continueLink || `/topic/${progress.activeTopic.topicSlug}`}
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
                                                    '& .arrow-icon': {
                                                        transform: 'translateX(8px)',
                                                    },
                                                },
                                            }}
                                        >
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
                                                            src={getTopicImage(progress.activeTopic.topicSlug)}
                                                            alt={progress.activeTopic.topicName}
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
                                                            color: 'text.primary',
                                                        }}
                                                    >
                                                        {progress.activeTopic.topicName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            lineHeight: 1.6,
                                                            minHeight: '40px',
                                                        }}
                                                    >
                                                        Continue where you left off
                                                    </Typography>
                                                </Box>

                                                {/* Stats Row */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1.5,
                                                        justifyContent: 'center',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <Chip
                                                        icon={<MenuBook sx={{ fontSize: 16 }} />}
                                                        label={`${progress.activeTopic.completedSections}/${progress.activeTopic.totalSections} Chapters`}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '9999px',
                                                            fontWeight: 600,
                                                            bgcolor: 'action.hover',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    />
                                                    <Chip
                                                        icon={<PlayArrow sx={{ fontSize: 16 }} />}
                                                        label={`${progress.activeTopic.percentage}%`}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '9999px',
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            bgcolor: `${topicColor}20`,
                                                            color: topicColor,
                                                            border: `2px solid ${topicColor}40`,
                                                        }}
                                                    />
                                                </Box>

                                                {/* Progress Bar */}
                                                <Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress.activeTopic.percentage}
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

                                                {/* Action Button */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 1,
                                                        mt: 'auto',
                                                        pt: 2,
                                                        color: topicColor,
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    <span>Continue Learning</span>
                                                    <ArrowForward
                                                        className="arrow-icon"
                                                        sx={{
                                                            fontSize: 20,
                                                            transition: 'transform 0.3s ease',
                                                        }}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })()}

                        {/* Recent Bookmarks */}
                        {recentBookmarks.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -12 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Card
                                        sx={{
                                            height: '100%',
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
                                            boxShadow: '0 8px 32px rgba(90, 200, 250, 0.2)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                            '&:hover': {
                                                boxShadow: '0 24px 64px rgba(90, 200, 250, 0.35)',
                                                borderColor: '#5ac8fa',
                                            },
                                        }}
                                    >
                                        {/* Gradient Background Accent */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '200px',
                                                background: 'linear-gradient(135deg, rgba(90, 200, 250, 0.15) 0%, transparent 100%)',
                                                opacity: 0.6,
                                                pointerEvents: 'none',
                                            }}
                                        />

                                        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: '16px',
                                                        background: 'linear-gradient(135deg, rgba(90, 200, 250, 0.2) 0%, rgba(50, 174, 216, 0.2) 100%)',
                                                        border: '2px solid',
                                                        borderColor: 'rgba(90, 200, 250, 0.4)',
                                                    }}
                                                >
                                                    <Bookmark sx={{ color: '#5ac8fa', fontSize: 28 }} />
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                                    Recent Bookmarks
                                                </Typography>
                                            </Box>
                                            {/* Activity Section - Continue Learning & Bookmarks */}
                                            {loading ? (
                                                <Container maxWidth="lg" sx={{ mt: 10 }}>
                                                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
                                                        Loading your activity...
                                                    </Typography>
                                                    <Grid container spacing={4}>
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{
                                                                height: 300,
                                                                background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.1) 0%, transparent 100%)',
                                                                borderRadius: '32px',
                                                                animation: 'pulse 1.5s ease-in-out infinite'
                                                            }} />
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{
                                                                height: 300,
                                                                background: 'linear-gradient(135deg, rgba(90, 200, 250, 0.1) 0%, transparent 100%)',
                                                                borderRadius: '32px',
                                                                animation: 'pulse 1.5s ease-in-out 0.3s infinite'
                                                            }} />
                                                        </Grid>
                                                    </Grid>
                                                </Container>
                                            ) : hasActivity && (
                                                <Container maxWidth="lg" sx={{ mt: 10 }}>
                                                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
                                                        Pick up where you left off
                                                    </Typography>

                                                    <Grid container spacing={4}>
                                                        {/* Continue Learning Card */}
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            {recentBookmarks.map((b) => {
                                                                const bookmarkTopicColor = getTopicColor(b.topicSlug, isDark);

                                                                return (
                                                                    <Box
                                                                        key={b.id}
                                                                        component={Link}
                                                                        to={b.type === 'topic' ? `/topic/${b.slug}` : `/topic/${b.topicSlug}/category/${b.categorySlug}${b.type === 'section' ? `/section/${b.slug}` : ''}`}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 2,
                                                                            p: 2,
                                                                            borderRadius: '16px',
                                                                            bgcolor: 'action.hover',
                                                                            textDecoration: 'none',
                                                                            border: '2px solid',
                                                                            borderColor: 'transparent',
                                                                            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                                            '&:hover': {
                                                                                bgcolor: `${bookmarkTopicColor}10`,
                                                                                borderColor: bookmarkTopicColor,
                                                                                transform: 'translateY(-4px)',
                                                                                boxShadow: `0 8px 24px ${bookmarkTopicColor}40`,
                                                                                '& .bookmark-icon': {
                                                                                    transform: 'scale(1.1) rotate(5deg)',
                                                                                },
                                                                                '& .bookmark-arrow': {
                                                                                    transform: 'translateX(8px)',
                                                                                },
                                                                            },
                                                                        }}
                                                                    >
                                                                        {/* Topic Icon */}
                                                                        <Box
                                                                            className="bookmark-icon"
                                                                            sx={{
                                                                                width: 48,
                                                                                height: 48,
                                                                                borderRadius: '12px',
                                                                                background: `linear-gradient(135deg, ${bookmarkTopicColor}20 0%, ${bookmarkTopicColor}10 100%)`,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                border: '2px solid',
                                                                                borderColor: `${bookmarkTopicColor}40`,
                                                                                flexShrink: 0,
                                                                                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={getTopicImage(b.topicSlug)}
                                                                                alt={b.topicSlug}
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

                                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    color: bookmarkTopicColor,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                }}
                                                                            >
                                                                                {b.title}
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                                                <Chip
                                                                                    label={b.type}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        height: '20px',
                                                                                        fontSize: '0.7rem',
                                                                                        fontWeight: 600,
                                                                                        textTransform: 'capitalize',
                                                                                        bgcolor: `${bookmarkTopicColor}20`,
                                                                                        color: bookmarkTopicColor,
                                                                                        border: `1px solid ${bookmarkTopicColor}40`,
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        </Box>

                                                                        <ArrowForward
                                                                            className="bookmark-arrow"
                                                                            sx={{
                                                                                color: bookmarkTopicColor,
                                                                                fontSize: 20,
                                                                                flexShrink: 0,
                                                                                transition: 'transform 0.3s ease',
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            })}
                                                            <Button
                                                                component={Link}
                                                                to="/bookmarks"
                                                                variant="outlined"
                                                                fullWidth
                                                                sx={{
                                                                    borderRadius: '9999px',
                                                                    mt: 1,
                                                                    borderColor: '#5e5ce6',
                                                                    color: '#5e5ce6',
                                                                    borderWidth: '2px',
                                                                    '&:hover': {
                                                                        borderWidth: '2px',
                                                                        borderColor: '#5e5ce6',
                                                                        background: 'rgba(94, 92, 230, 0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                View All Bookmarks
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                </motion.div>
                                    </Grid>
                        )}
                            </Grid>
                </Container>
            )}

            {/* Features Grid */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Typography
                    variant="h3"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        mb: 6,
                        background: 'linear-gradient(135deg, #5e5ce6 0%, #5ac8fa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Why Choose PrepHub?
                </Typography>
                <Grid container spacing={3}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -12 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        borderRadius: '32px',
                                        textAlign: 'center',
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
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            boxShadow: `0 24px 64px ${feature.color}40`,
                                            borderColor: feature.color,
                                        },
                                    }}
                                >
                                    {/* Gradient Background Accent */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '200px',
                                            background: `linear-gradient(135deg, ${feature.color}15 0%, transparent 100%)`,
                                            opacity: 0.6,
                                            pointerEvents: 'none',
                                        }}
                                    />

                                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                p: 2.5,
                                                borderRadius: '24px',
                                                background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                                                color: feature.color,
                                                mb: 2,
                                                border: '2px solid',
                                                borderColor: `${feature.color}40`,
                                                boxShadow: `0 8px 24px ${feature.color}30`,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
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

export default Home;
