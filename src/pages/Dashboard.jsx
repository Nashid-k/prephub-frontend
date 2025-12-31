import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Typography, Box, Button, Alert, useTheme as useMuiTheme, Fade, Grid, Skeleton } from '@mui/material';
import { Refresh, School, Code, Storage, Cloud, Psychology, TrendingUp, Timer, EmojiEvents, Computer, Architecture, Handyman } from '@mui/icons-material';
import { curriculumAPI } from '../services/api';
import TopicCard from '../components/TopicCard';
import DashboardHeader from '../components/DashboardHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import Walkthrough from '../components/Walkthrough'; // New import
import { useAuth } from '../context/AuthContext'; // New import
import axios from 'axios'; // New import
import { getStreakData } from '../utils/streakTracker';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth(); // Destructure user from useAuth
    const theme = useMuiTheme(); // New hook
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null); // New state
    const [runTour, setRunTour] = useState(false); // New state
    const [isPersonalized, setIsPersonalized] = useState(false); // Track if order is personalized
    const [aiSuggestion, setAiSuggestion] = useState(null); // New state for AI Suggestion

    useEffect(() => {
        // Check if user is new OR local storage flag implies we haven't seen the tour yet
        // Ideally, user.isNew comes from the login response.
        // If user object doesn't persist 'isNew' after refresh, we might need a localStorage check.
        const hasSeenTour = localStorage.getItem('hasSeenTour');

        if (user?.isNew && !hasSeenTour) {
            setRunTour(true);
        }
    }, [user]);

    const handleTourClose = () => {
        setRunTour(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    useEffect(() => {
        // 1. Load from cache first for instant UI
        const cachedTopics = localStorage.getItem('prephub_topics');
        if (cachedTopics) {
            try {
                setTopics(JSON.parse(cachedTopics));
                setLoading(false); // Stop loading if we have cached data
            } catch (e) {
                console.error('Failed to parse cached topics');
            }
        }

        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            // Only show loader if we don't have cached data
            if (!localStorage.getItem('prephub_topics')) {
                setLoading(true);
            }

            const response = await curriculumAPI.getPersonalizedTopics();

            if (response.data.personalized) {
                setIsPersonalized(true);
                if (response.data.aiSuggestion) {
                    setAiSuggestion(response.data.aiSuggestion);
                }
            } else {
                setIsPersonalized(false);
            }

            const newTopics = response.data.topics;

            // Filter out known child topics that are covered by Groups
            // This cleans up the dashboard to show only Roots
            const HIDDEN_SLUGS = [
                'blind-75', 'algorithms', 'dsa', 'data-structures', // Inside Algo & DS
                'operating-systems', 'networking', // Inside CS Fundamentals
                'system-design', 'api-design', 'caching-performance', 'reliability-observability', 'security-engineering', 'concurrency-async', // Inside Sys Design
                'devops-basics', 'code-quality', 'testing-strategy', 'product-thinking' // Inside Eng Practices
            ];

            const CORE_GROUPS = [
                'algorithms-data-structures',
                'cs-fundamentals',
                'system-design-architecture',
                'engineering-practices'
            ];

            const filteredTopics = newTopics.filter(t => !HIDDEN_SLUGS.includes(t.slug));

            // Sort: Core Groups first, then others (like MERN)
            const sortedTopics = filteredTopics.sort((a, b) => {
                const aIsGroup = CORE_GROUPS.includes(a.slug);
                const bIsGroup = CORE_GROUPS.includes(b.slug);
                if (aIsGroup && !bIsGroup) return -1;
                if (!aIsGroup && bIsGroup) return 1;
                return 0; // Keep original order for others
            });

            setTopics(sortedTopics);
            // 2. Save to cache for next visit
            localStorage.setItem('prephub_topics', JSON.stringify(sortedTopics));
            setError(null);
        } catch (err) {
            console.error('Error fetching topics:', err);
            // If we have cached data, don't show error (just use stale data)
            if (!localStorage.getItem('prephub_topics')) {
                setError('Failed to load topics. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl">
                    <LoadingSpinner message="Loading curriculum..." />
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="md">
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: '24px',
                            p: 3,
                        }}
                        action={
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={fetchTopics}
                                sx={{
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                }}
                            >
                                Retry
                            </Button>
                        }
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {error}
                        </Typography>
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', py: 6 }}>
            <Container maxWidth="xl">
                <Walkthrough run={runTour} onClose={handleTourClose} />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <Box id="dashboard-header" sx={{ mb: 6, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(10, 132, 255, 0.3)',
                            }}
                        >
                            <School sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Your Learning Journey
                        </Typography>
                        {isPersonalized && (
                            <Chip
                                label="Personalized for you"
                                color="primary"
                                size="small"
                                icon={<TrendingUp />}
                                sx={{ mb: 2, background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)' }}
                            />
                        )}

                        {/* AI Suggestion Card */}
                        {aiSuggestion && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: 600,
                                        mx: 'auto',
                                        mb: 4,
                                        p: 3,
                                        borderRadius: '24px',
                                        background: (theme) => theme.palette.mode === 'dark' ?
                                            'linear-gradient(135deg, rgba(94, 92, 230, 0.2) 0%, rgba(94, 92, 230, 0.05) 100%)' :
                                            'linear-gradient(135deg, rgba(94, 92, 230, 0.1) 0%, rgba(94, 92, 230, 0.05) 100%)',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(94, 92, 230, 0.3)' : 'rgba(94, 92, 230, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        textAlign: 'left',
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'start'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex'
                                        }}
                                    >
                                        <Psychology fontSize="medium" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            AI Recommended Next Step
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                            {topics.find(t => t.slug === aiSuggestion.topicSlug)?.name || aiSuggestion.topicSlug}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {aiSuggestion.reason}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            href={`/topic/${aiSuggestion.topicSlug}`}
                                            sx={{ borderRadius: '9999px', textTransform: 'none' }}
                                        >
                                            Start Learning
                                        </Button>
                                    </Box>
                                </Box>
                            </motion.div>
                        )}

                        {isPersonalized && (
                            <Chip
                                label="Personalized for you"
                                color="primary"
                                size="small"
                                sx={{ mb: 2, background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)' }}
                            />
                        )}
                        <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400, mb: 3 }}>
                            Choose a topic to begin mastering
                        </Typography>

                        {/* Stats & Recommendations Section */}
                        <Box sx={{ mx: 'auto', mt: 4 }}>
                            {/* Dashboard Hero Section */}
                            <DashboardHeader user={user} />
                        </Box>
                    </Box>
                </motion.div>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                            lg: 'repeat(4, 1fr)',
                            xl: 'repeat(4, 1fr)'
                        },
                        gap: 3,
                        maxWidth: '100%',
                        mx: 'auto',
                        px: 2
                    }}
                >
                    {/* Manual DSA Card */}
                    <Box sx={{ display: 'flex', height: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <TopicCard
                                topic={{
                                    _id: 'dsa-agg',
                                    name: 'Algorithms & Data Structures',
                                    description: 'Master Algorithms, Data Structures and the Blind 75 list.',
                                    slug: 'algorithms', // borrowing image from algorithms
                                    categoryCount: 3, // 3 modules
                                    progress: 0 // logic for agg progress optional
                                }}
                                customLink="/dsa"
                            />
                        </motion.div>
                    </Box>

                    {/* CS Fundamentals Group */}
                    <Box sx={{ display: 'flex', height: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <TopicCard
                                topic={{
                                    _id: 'cs-funds-agg',
                                    name: 'CS Fundamentals',
                                    description: 'Operating Systems and Networking theories.',
                                    slug: 'operating-systems',
                                    icon: '💻',
                                    categoryCount: 2,
                                    progress: 0
                                }}
                                customLink="/cs-fundamentals"
                            />
                        </motion.div>
                    </Box>

                    {/* System Design Group */}
                    <Box sx={{ display: 'flex', height: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <TopicCard
                                topic={{
                                    _id: 'sys-design-agg',
                                    name: 'System Design & Architecture',
                                    description: 'Scalability, API Design, Security, and Reliability.',
                                    slug: 'system-design',
                                    icon: '🏗️',
                                    categoryCount: 6,
                                    progress: 0
                                }}
                                customLink="/system-design"
                            />
                        </motion.div>
                    </Box>

                    {/* Engineering Practices Group */}
                    <Box sx={{ display: 'flex', height: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            style={{ width: '100%', height: '100%', display: 'flex' }}
                        >
                            <TopicCard
                                topic={{
                                    _id: 'eng-practices-agg',
                                    name: 'Engineering Practices',
                                    description: 'Testing, DevOps, Code Quality, and Product Thinking.',
                                    slug: 'devops-basics',
                                    icon: '🚀',
                                    categoryCount: 4,
                                    progress: 0
                                }}
                                customLink="/engineering-practices"
                            />
                        </motion.div>
                    </Box>

                    {topics.filter(t => ![
                        'algorithms', 'data-structures', 'blind-75', 'dsa',
                        'operating-systems', 'networking',
                        'system-design', 'api-design', 'security-engineering', 'reliability-observability', 'caching-performance', 'concurrency',
                        'testing-strategy', 'devops-basics', 'code-quality', 'product-thinking',
                        // Also exclude the Core Groups because they are Manually Rendered above
                        'algorithms-data-structures', 'cs-fundamentals', 'system-design-architecture', 'engineering-practices'
                    ].includes(t.slug)).map((topic, index) => (
                        <Box key={topic._id} sx={{ display: 'flex', height: 'auto' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.05 + 0.4,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <TopicCard topic={topic} />
                            </motion.div>
                        </Box>
                    ))}
                </Box>

                {/* Empty State */}
                {topics.length === 0 && !loading && !error && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary">
                            No topics available yet
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Dashboard
