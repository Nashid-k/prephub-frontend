import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    Avatar,
    Stack,
} from '@mui/material';
import {
    Psychology,
    Code,
    GpsFixed,
    TrendingUp,
    ArrowForward,
    Bookmark,
    RocketLaunch,
    School,
    PlayArrow,
    CheckCircle,
    MenuBook,
    AutoStories,
    Widgets,
    Speed,
    EmojiEvents,
    LocalFireDepartment,
    AutoAwesome,
    FlashOn,
    LaptopMac,
    Timeline,
    Architecture
} from '@mui/icons-material';
import OnboardingModal from '../components/features/onboarding/OnboardingModal';
import { progressAPI } from '../services/api';
import { getBookmarks } from '../utils/bookmarks';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import { useAuth } from '../context/AuthContext';
import './Home.css';

import { styled } from '@mui/material/styles';

const BannerBadge = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    marginBottom: theme.spacing(2),
}));

const Home = () => {
    const { user, experienceLevel, role } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [recentBookmarks, setRecentBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ topics: 0, sections: 0, active: 0 });
    const [showOnboarding, setShowOnboarding] = useState(false);

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

                // Calculate stats
                const totalSections = progressData.topics.reduce((sum, t) => sum + t.totalSections, 0);
                const activeLearning = progressData.topics.filter(t => t.percentage > 0 && t.percentage < 100).length;

                setStats({
                    topics: progressData.totalTopics || 8,
                    sections: totalSections || 120,
                    active: activeLearning
                });

                const bookmarks = getBookmarks();
                setRecentBookmarks(bookmarks.slice(0, 3));

            } catch (error) {
                console.error("Error fetching home data:", error);
                // Set default stats
                setStats({ topics: 8, sections: 120, active: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const hasActivity = progress?.activeTopic || recentBookmarks.length > 0;

    const features = [
        {
            icon: <AutoAwesome sx={{ fontSize: 40 }} />,
            title: 'AI-Powered Tutor',
            description: 'Context-aware explanations generated in real-time for any topic.',
            color: '#5e5ce6',
            gradient: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
        },
        {
            icon: <FlashOn sx={{ fontSize: 40 }} />,
            title: 'Instant Performance',
            description: 'Navigate seamlessly with our new Intelligent Caching engine.',
            color: '#30d158',
            gradient: 'linear-gradient(135deg, #30d158 0%, #32d74b 100%)',
        },
        {
            icon: <LaptopMac sx={{ fontSize: 40 }} />,
            title: 'Interactive Editor',
            description: 'Write, run, and test code in 10+ languages directly in browser.',
            color: '#ff9f0a',
            gradient: 'linear-gradient(135deg, #ff9f0a 0%, #ff9500 100%)',
        },
        {
            icon: <Timeline sx={{ fontSize: 40 }} />,
            title: 'Smart Curriculum',
            description: 'Personalized learning paths tailored to your experience level.',
            color: '#5ac8fa',
            gradient: 'linear-gradient(135deg, #5ac8fa 0%, #64d2ff 100%)',
        },
    ];

    const handleStartLearning = () => {
        if (hasActivity) {
            navigate('/dashboard');
        } else {
            setShowOnboarding(true);
        }
    };

    const handleOnboardingComplete = (data) => {
        console.log('Onboarding complete:', data);
        setShowOnboarding(false);
        navigate('/dashboard');
    };

    const platformStats = [
        { icon: <Widgets />, label: 'Topics', value: stats.topics, color: '#5e5ce6' },
        { icon: <MenuBook />, label: 'Sections', value: `${stats.sections}+`, color: '#5ac8fa' },
        { icon: <Code />, label: 'Code Examples', value: '500+', color: '#30d158' },
        { icon: <EmojiEvents />, label: 'Practice Problems', value: '75+', color: '#ff9f0a' },
    ];


    // Elite Title Mapping
    const getEliteTitle = (level, role) => {
        // If role is defined (e.g. "Frontend Engineer"), use it + level
        if (role) {
            const roleName = role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${level.charAt(0).toUpperCase() + level.slice(1)} ${roleName}`;
        }

        switch (level) {
            case 'beginner': return "Apprentice Developer";
            case 'intermediate': return "Senior Engineer";
            case 'advanced': return "Distinguished Architect";
            default: return "Software Engineer";
        }
    };

    const eliteTitle = getEliteTitle(experienceLevel || 'advanced', role);

    // Quick Actions Configuration
    const quickActions = [
        {
            title: 'Debug Console',
            icon: <Code />,
            path: '/share',
            color: '#ff9f0a',
            desc: 'Analyze & Fix Code'
        },
        {
            title: 'Deep Dive',
            icon: <Psychology />,
            path: '/dashboard',
            color: '#5e5ce6',
            desc: 'Master Core Concepts'
        },
        {
            title: 'System Design',
            icon: <Architecture />,
            path: '/system-design',
            color: '#30d158',
            desc: 'Scalability & Architecture'
        }
    ];

    if (user) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', pb: 8 }}>
                {/* Elite Hero Section */}
                <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
                    <Box
                        sx={{
                            p: { xs: 3, md: 6 },
                            borderRadius: '32px',
                            background: isDark
                                ? 'rgba(30, 30, 30, 0.4)'
                                : 'rgba(255, 255, 255, 0.65)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(30px)',
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background Decor */}
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', opacity: 0.1, background: 'linear-gradient(90deg, transparent, #5e5ce6)', pointerEvents: 'none' }} />

                        <Grid container alignItems="center" spacing={{ xs: 2, md: 4 }}>
                            <Grid item xs={12} md={8}>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                        <BannerBadge>{eliteTitle}</BannerBadge>
                                        <Chip
                                            icon={<AutoAwesome sx={{ fontSize: 16 }} />}
                                            label={experienceLevel === 'advanced' ? "Elite Mode Active" : "Career Path Active"}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(94, 92, 230, 0.2)',
                                                color: '#5e5ce6',
                                                fontWeight: 700,
                                                border: '1px solid rgba(94, 92, 230, 0.3)'
                                            }}
                                        />
                                    </Stack>

                                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                        Command Center <br />
                                        <Typography component="span" variant="inherit" sx={{ color: '#5e5ce6' }}>
                                            {user.name?.split(' ')[0]}
                                        </Typography>
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mb: 4, fontWeight: 400 }}>
                                        Your personalized intelligence hub is online.
                                        {loading ? ' Syncing latest metrics...' : ` You have ${hasActivity ? 'active' : 'no'} pending modules in your queue.`}
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<PlayArrow />}
                                            onClick={handleStartLearning}
                                            sx={{
                                                borderRadius: '16px',
                                                px: 4, py: 1.5,
                                                bgcolor: '#fff',
                                                color: '#000',
                                                fontWeight: 700,
                                                '&:hover': { bgcolor: '#f0f0f0' }
                                            }}
                                        >
                                            {progress?.activeTopic ? 'Resume Session' : 'Start New Session'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            startIcon={<TrendingUp />}
                                            component={Link}
                                            to="/progress"
                                            sx={{
                                                borderRadius: '16px',
                                                px: 4,
                                                borderColor: 'rgba(255,255,255,0.2)',
                                                color: 'text.primary',
                                                '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                                            }}
                                        >
                                            Analytics
                                        </Button>
                                    </Stack>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>

                {/* Quick Actions Grid */}
                <Container maxWidth="xl" sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, opacity: 0.8 }}>Quick Actions</Typography>
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={12} key={index} sx={{ display: 'flex' }}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ width: '100%', display: 'flex' }}
                                >
                                    <Link to={action.path} style={{ textDecoration: 'none', width: '100%', display: 'flex' }}>
                                        <Box
                                            sx={{
                                                p: { xs: 2, md: 3 },
                                                width: '100%',
                                                borderRadius: '24px',
                                                bgcolor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
                                                border: '1px solid',
                                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                                                backdropFilter: 'blur(30px)',
                                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(31, 38, 135, 0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: { xs: 1.5, md: 2 },
                                                position: 'relative',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                '&:hover': {
                                                    borderColor: action.color,
                                                    bgcolor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                                                    boxShadow: `0 20px 40px ${action.color}20`,
                                                    '& .action-icon': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        bgcolor: action.color,
                                                        color: '#fff'
                                                    },
                                                    '& .arrow-icon': {
                                                        transform: 'translateX(4px)',
                                                        opacity: 1,
                                                        color: action.color
                                                    }
                                                }
                                            }}
                                        >
                                            <Box
                                                className="action-icon"
                                                sx={{
                                                    p: { xs: 1.25, md: 1.5 },
                                                    borderRadius: '16px',
                                                    bgcolor: `${action.color}15`,
                                                    color: action.color,
                                                    display: 'flex',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                {React.cloneElement(action.icon, { fontSize: '1.5rem' })}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.95rem', md: '1rem' } }}>
                                                    {action.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.85rem' }, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {action.desc}
                                                </Typography>
                                            </Box>
                                            <ArrowForward
                                                className="arrow-icon"
                                                sx={{
                                                    ml: 'auto',
                                                    opacity: 0.3,
                                                    fontSize: 18,
                                                    transition: 'all 0.3s ease',
                                                    flexShrink: 0
                                                }}
                                            />
                                        </Box>
                                    </Link>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* Recent Activity Section */}
                {hasActivity && (
                    <Container maxWidth="xl">
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, opacity: 0.8 }}>Current Focus</Typography>
                        <Grid container spacing={3}>
                            {progress?.activeTopic && (() => {
                                const topicColor = getTopicColor(progress.activeTopic.topicSlug, isDark);
                                return (
                                    <Grid item xs={12}>
                                        <CardContent sx={{
                                            p: 4,
                                            bgcolor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
                                            borderRadius: '24px',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                                            backdropFilter: 'blur(30px)',
                                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <Box sx={{ width: 80, height: 80, borderRadius: '20px', bgcolor: `${topicColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img
                                                    src={getTopicImage(progress.activeTopic.topicSlug)}
                                                    alt={progress.activeTopic.topicName}
                                                    style={{ width: '50%' }}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{progress.activeTopic.topicName}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <LinearProgress variant="determinate" value={progress.activeTopic.percentage} sx={{ width: 200, height: 8, borderRadius: 4, bgcolor: `${topicColor}20`, '& .MuiLinearProgress-bar': { bgcolor: topicColor } }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: topicColor }}>{progress.activeTopic.percentage}% Complete</Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                component={Link}
                                                to={progress.activeTopic.continueLink || `/topic/${progress.activeTopic.topicSlug}`}
                                                sx={{
                                                    borderRadius: '12px',
                                                    bgcolor: topicColor,
                                                    fontWeight: 700,
                                                    px: 4,
                                                    py: 1.5,
                                                    boxShadow: `0 8px 20px ${topicColor}40`
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        </CardContent>
                                    </Grid>
                                );
                            })()}
                        </Grid>
                    </Container>
                )
                }
            </Box >
        );
    }

    // Guest View (The Pitch)
    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    minHeight: hasActivity ? '55vh' : '75vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    pb: hasActivity ? 4 : 8,
                }}
            >
                {/* Animated Gradient Background */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isDark
                            ? 'radial-gradient(ellipse at top left, rgba(94, 92, 230, 0.2) 0%, transparent 50%), radial-gradient(ellipse at top right, rgba(90, 200, 250, 0.15) 0%, transparent 50%)'
                            : 'radial-gradient(ellipse at top left, rgba(94, 92, 230, 0.1) 0%, transparent 50%), radial-gradient(ellipse at top right, rgba(90, 200, 250, 0.08) 0%, transparent 50%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(94, 92, 230, 0.15) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        animation: 'float 20s ease-in-out infinite',
                        '@keyframes float': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(-30px, -30px)' },
                        },
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            {/* Logo Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ duration: 0.6, type: 'spring' }}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 3,
                                        borderRadius: '32px',
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                        mb: 4,
                                        boxShadow: '0 16px 48px rgba(94, 92, 230, 0.5)',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: -2,
                                            borderRadius: '32px',
                                            padding: '2px',
                                            background: 'linear-gradient(135deg, #5e5ce6, #0a84ff, #30d158)',
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            opacity: 0.6,
                                        },
                                    }}
                                >
                                    <School sx={{ fontSize: 64, color: 'white' }} />
                                </Box>
                            </motion.div>

                            {/* Title */}
                            <Typography
                                variant="h1"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '2.25rem', md: '4.5rem' },
                                    mb: 2,
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                Master the{' '}
                                <Box
                                    component="span"
                                    sx={{
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Art of Code
                                </Box>
                            </Typography>

                            <Typography
                                variant="h5"
                                color="text.secondary"
                                sx={{
                                    mb: 5,
                                    maxWidth: '750px',
                                    mx: 'auto',
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1.1rem', md: '1.4rem' }
                                }}
                            >
                                {hasActivity
                                    ? 'Continue your learning journey and achieve your goals'
                                    : 'AI-powered platform to master web development, DSA, and ace technical interviews'}
                            </Typography>

                            {/* CTA Buttons */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mb: 6 }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleStartLearning}
                                        variant="contained"
                                        size="large"
                                        startIcon={<RocketLaunch />}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 5,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                            boxShadow: '0 12px 32px rgba(94, 92, 230, 0.5)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #7d7bf0 0%, #0a84ff 100%)',
                                                boxShadow: '0 16px 40px rgba(94, 92, 230, 0.6)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                        }}
                                    >
                                        {hasActivity ? 'Continue Learning' : 'Start My Journey'}
                                    </Button>
                                </motion.div>
                                {!hasActivity && (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            component={Link}
                                            to="/progress"
                                            variant="outlined"
                                            size="large"
                                            startIcon={<TrendingUp />}
                                            sx={{
                                                borderRadius: '9999px',
                                                px: 5,
                                                py: 2,
                                                fontSize: '1.1rem',
                                                fontWeight: 700,
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
                                            View Progress
                                        </Button>
                                    </motion.div>
                                )}
                            </Stack>

                            {/* Platform Stats */}
                            {!hasActivity && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
                                        {platformStats.map((stat, index) => (
                                            <Grid item xs={6} sm={3} key={index}>
                                                <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                                                    <Box
                                                        sx={{
                                                            p: { xs: 1.5, md: 2.5 },
                                                            borderRadius: '20px',
                                                            background: isDark
                                                                ? 'rgba(30, 30, 30, 0.4)'
                                                                : 'rgba(255, 255, 255, 0.65)',
                                                            border: '1px solid',
                                                            borderColor: isDark
                                                                ? 'rgba(255, 255, 255, 0.08)'
                                                                : 'rgba(255, 255, 255, 0.5)',
                                                            backdropFilter: 'blur(30px)',
                                                            textAlign: 'center',
                                                            transition: 'all 0.3s',
                                                            '&:hover': {
                                                                borderColor: stat.color,
                                                                boxShadow: `0 20px 40px ${stat.color}20`,
                                                            },
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                color: stat.color,
                                                                mb: 1,
                                                                '& svg': { fontSize: 28 }
                                                            }}
                                                        >
                                                            {stat.icon}
                                                        </Box>
                                                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: stat.color }}>
                                                            {stat.value}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                            {stat.label}
                                                        </Typography>
                                                    </Box>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </motion.div>
                            )}
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Activity Section (for logged-in users) */}
            {/* Removed: Handled in Elite Command Center */}

            {/* Recent Bookmarks */}


            {/* Features Grid */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.75rem' },
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Why Choose PrepHub?
                    </Typography>
                    <Typography
                        variant="h6"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 6, maxWidth: 700, mx: 'auto', fontWeight: 400 }}
                    >
                        Everything you need to master coding and ace technical interviews
                    </Typography>
                </motion.div>
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
                                                ? 'rgba(30, 30, 30, 0.4)'
                                                : 'rgba(255, 255, 255, 0.65)',
                                        backdropFilter: 'blur(30px)',
                                        border: '1px solid',
                                        borderColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(255, 255, 255, 0.5)',
                                        boxShadow: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                                                : '0 20px 40px rgba(31, 38, 135, 0.1)',
                                        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 30px 60px ${feature.color}30`,
                                            borderColor: feature.color,
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(30, 30, 30, 0.6)'
                                                    : 'rgba(255, 255, 255, 0.8)',
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
                                                background: feature.gradient,
                                                color: 'white',
                                                mb: 2,
                                                boxShadow: `0 8px 24px ${feature.color}40`,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1.5 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>


            {/* Onboarding Modal */}
            <OnboardingModal
                open={showOnboarding}
                onComplete={handleOnboardingComplete}
                onSkip={() => {
                    setShowOnboarding(false);
                    navigate('/dashboard');
                }}
            />
        </Box >
    );
};

export default Home;
