import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Typography, Box, Button, Alert, useTheme as useMuiTheme, Grid, Skeleton, Chip } from '@mui/material';
import { Refresh, School, Code, Storage, Cloud, Psychology, TrendingUp, Timer, EmojiEvents, Computer, Architecture, Handyman, ArrowForward } from '@mui/icons-material';
import { curriculumAPI } from '../services/api';
import TopicCard from '../components/TopicCard';
import DashboardHeader from '../components/DashboardHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import Walkthrough from '../components/Walkthrough';
import OnboardingModal from '../components/OnboardingModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getStreakData } from '../utils/streakTracker';
import './Dashboard.css';
import { generateSmartPath, getNextRecommendation } from '../utils/SmartCurriculum';

const Dashboard = () => {
    const { user } = useAuth();
    const theme = useMuiTheme();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [runTour, setRunTour] = useState(false);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [selectedPath, setSelectedPath] = useState('all');
    const [experienceLevel, setExperienceLevel] = useState('0-1_year');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [aiStrategy, setAiStrategy] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(1); // New state for modal entry point

    useEffect(() => {
        const aiConfigStr = localStorage.getItem('prephub_ai_path_config');
        if (aiConfigStr && selectedPath !== 'all') {
            try {
                const config = JSON.parse(aiConfigStr);
                if (config.pathId === selectedPath) {
                    setAiStrategy(config.learningStrategy);
                    if (config.experienceLevelId) {
                        setExperienceLevel(config.experienceLevelId);
                    }
                } else {
                    setAiStrategy(null);
                    setExperienceLevel('0-1_year');
                }
            } catch (e) {
                setAiStrategy(null);
                setExperienceLevel('0-1_year');
            }
        } else {
            setAiStrategy(null);
            setExperienceLevel('0-1_year');
        }
    }, [selectedPath]);

    const learningPaths = {
        'new-beginner': {
            name: '🌟 I\'m Brand New to Coding',
            description: 'Start from the very basics'
        },
        'mern-fullstack': {
            name: '💻 MERN Full Stack',
            description: 'MongoDB, Express, React, Node.js'
        },
        'mean-fullstack': {
            name: '🅰️ MEAN Full Stack',
            description: 'MongoDB, Express, Angular, Node.js'
        },
        'python-fullstack': {
            name: '🐍 Python Full Stack',
            description: 'Python, Django, React, PostgreSQL'
        },
        'java-enterprise': {
            name: '☕ Java Enterprise',
            description: 'Java, Angular, PostgreSQL'
        },
        'flutter-mobile': {
            name: '📱 Mobile Development',
            description: 'Flutter & Dart cross-platform'
        },
        'interview-prep': {
            name: '🎯 Interview Preparation',
            description: 'DSA, System Design, CS Fundamentals'
        },
        'frontend-specialist': {
            name: '🎨 Frontend Specialist',
            description: 'Modern UI development'
        },
        'backend-specialist': {
            name: '⚙️ Backend Specialist',
            description: 'Server-side development'
        },
        'golang-backend': {
            name: '🔷 Golang Backend',
            description: 'Go for high-performance systems'
        },
        'csharp-dotnet': {
            name: '🔹 C# & .NET',
            description: 'Microsoft enterprise stack'
        },
        'systems-programming': {
            name: '⚡ Systems Programming',
            description: 'Low-level C programming'
        },
        'machine-learning-engineer': {
            name: '🤖 ML Engineer',
            description: 'AI, Deep Learning & MLOps'
        },
        'data-analyst': {
            name: '📊 Data Analyst',
            description: 'SQL, Python, Visualization'
        },
        'aws-cloud-architect': {
            name: '☁️ Cloud Architect',
            description: 'AWS, Security & DevOps'
        },
        'all': {
            name: '📚 Show All Topics',
            description: 'Browse everything'
        }
    };

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('prephub_onboarding_completed');
        const savedPath = localStorage.getItem('prephub_learning_path');

        if (!hasCompletedOnboarding) {
            setShowOnboarding(true);
        } else if (savedPath && learningPaths[savedPath]) {
            setSelectedPath(savedPath);
        }
    }, []);

    const handleOnboardingComplete = (pathData) => {
        setSelectedPath(pathData.id);
        if (pathData.experienceLevel) {
            setExperienceLevel(pathData.experienceLevel.id);
        }
        localStorage.setItem('prephub_learning_path', pathData.id);
        localStorage.setItem('prephub_onboarding_completed', 'true');
        setShowOnboarding(false);
    };

    const fetchTopics = async () => {
        try {
            if (!localStorage.getItem('prephub_topics')) {
                setLoading(true);
            }
            const params = { experienceLevel };
            const response = isPersonalized
                ? await curriculumAPI.getPersonalizedTopics(params)
                : await curriculumAPI.getAllTopics(params);

            if (response.data.success) {
                if (response.data.personalized) {
                    setIsPersonalized(true);
                    if (response.data.aiSuggestion) {
                        setAiSuggestion(response.data.aiSuggestion);
                    }
                }
                const newTopics = response.data.topics;
                // Exclude legacy or clutter items if needed, or rely on backend
                // Only hide truly deprecated/duplicate topics
                const HIDDEN_SLUGS = [
                    'html-css-basics', 'testing-qa', 'mobile-dev', 'security-basics',
                    'networking-basics', 'os-concepts', 'git-github'
                ];
                // Exclude hidden slugs
                const visibleTopics = newTopics.filter(t => !HIDDEN_SLUGS.includes(t.slug));

                setTopics(visibleTopics);
                localStorage.setItem('prephub_topics', JSON.stringify(visibleTopics));
            }
        } catch (err) {
            console.error('Failed to fetch topics:', err);
            setError('Failed to load curriculum');
        } finally {
            setLoading(false);
        }
    };

    // Re-trigger fetch when experience or personalization changes
    useEffect(() => {
        fetchTopics();
    }, [experienceLevel, isPersonalized]);

    const handleOnboardingSkip = () => {
        setSelectedPath('all');
        localStorage.setItem('prephub_learning_path', 'all');
        localStorage.setItem('prephub_onboarding_completed', 'true');
        setShowOnboarding(false);
    };

    const openOnboarding = (step = 1) => {
        setOnboardingStep(step);
        setShowOnboarding(true);
    };

    const handlePathChange = (event) => {
        const newPath = event.target.value;
        setSelectedPath(newPath);
        localStorage.setItem('prephub_learning_path', newPath);
    };

    const filteredTopics = useMemo(() => {
        let rawList = selectedPath === 'all'
            ? topics
            : generateSmartPath(topics, selectedPath, experienceLevel);

        // Apply AI Ordering if available
        const aiConfigStr = localStorage.getItem('prephub_ai_path_config');
        if (aiConfigStr && selectedPath !== 'all') {
            try {
                const aiConfig = JSON.parse(aiConfigStr);
                if (aiConfig.pathId === selectedPath && aiConfig.orderedSlugs) {
                    // Create a map for O(1) lookup of order
                    const orderMap = new Map(aiConfig.orderedSlugs.map((slug, index) => [slug, index]));

                    rawList = [...rawList].sort((a, b) => {
                        const indexA = orderMap.has(a.slug) ? orderMap.get(a.slug) : 999;
                        const indexB = orderMap.has(b.slug) ? orderMap.get(b.slug) : 999;
                        return indexA - indexB;
                    });
                }
            } catch (e) {
                console.error('Failed to apply AI ordering:', e);
            }
        }

        const SIMPLIFY_GROUPS = [
            {
                _id: 'dsa-agg',
                name: 'Algorithms & Data Structures',
                description: 'Master Algorithms, Data Structures and the Blind 75 list.',
                slug: 'algorithms',
                customLink: '/dsa',
                contains: ['algorithms', 'data-structures', 'blind-75', 'dsa-algorithms', 'dsa-datastructures']
            },
            {
                _id: 'sys-design-agg',
                name: 'System Design & Architecture',
                description: 'Scalability, API Design, Security, and Reliability.',
                slug: 'system-design',
                customLink: '/system-design',
                contains: ['system-design', 'api-design', 'caching-performance', 'reliability-observability', 'security-engineering', 'concurrency-async', 'concurrency']
            },
            {
                _id: 'cs-funds-agg',
                name: 'CS Fundamentals',
                description: 'Operating Systems and Networking theories.',
                slug: 'operating-systems',
                customLink: '/cs-fundamentals',
                contains: ['operating-systems', 'networking']
            },
            {
                _id: 'eng-practices-agg',
                name: 'Engineering Practices',
                description: 'Testing, DevOps, Code Quality, and Product Thinking.',
                slug: 'devops-basics',
                customLink: '/engineering-practices',
                contains: ['devops-basics', 'code-quality', 'testing-strategy', 'product-thinking']
            }
        ];

        let processedList = [];
        let handledGroups = new Set();

        for (const topic of rawList) {
            const groupDef = SIMPLIFY_GROUPS.find(g => g.contains.includes(topic.slug));
            if (groupDef) {
                if (!handledGroups.has(groupDef._id)) {
                    processedList.push({
                        ...groupDef,
                        isGroup: true,
                        // Sum the categoryCount of all topics in this group
                        categoryCount: rawList
                            .filter(t => groupDef.contains.includes(t.slug))
                            .reduce((sum, t) => sum + (t.categoryCount || 0), 0)
                    });
                    handledGroups.add(groupDef._id);
                }
            } else {
                processedList.push(topic);
            }
        }

        return processedList;
    }, [topics, selectedPath, experienceLevel]);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (user?.isNew && !hasSeenTour) {
            setRunTour(true);
        }
    }, [user]);

    const handleTourClose = () => {
        setRunTour(false);
        localStorage.setItem('hasSeenTour', 'true');
    };



    const nextRecommendation = useMemo(() => {
        if (!selectedPath || selectedPath === 'all') return null;
        if (loading) return null;
        return getNextRecommendation(filteredTopics);
    }, [selectedPath, loading, filteredTopics]);

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
                <OnboardingModal
                    open={showOnboarding}
                    onComplete={handleOnboardingComplete}
                    onSkip={handleOnboardingSkip}
                />
                <Walkthrough run={runTour} onClose={handleTourClose} />
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
                        <Box
                            sx={{
                                pt: { xs: 4, md: 12 },
                                pb: { xs: 4, md: 8 },
                                px: 3,
                                textAlign: 'center',
                                background: theme.palette.mode === 'dark'
                                    ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 50%)'
                                    : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 50%)',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        background: theme.palette.mode === 'dark'
                                            ? 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)'
                                            : 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: { xs: '2rem', md: '4rem' }
                                    }}
                                >
                                    Your Curriculum
                                </Typography>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{
                                        maxWidth: '600px',
                                        mx: 'auto',
                                        mb: 6,
                                        lineHeight: 1.6,
                                        fontWeight: 400
                                    }}
                                >
                                    Master the foundations of computer science and software engineering with our structured learning paths.
                                </Typography>
                            </motion.div>

                            {/* AI Strategy Display */}
                            {aiStrategy && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.15 }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '700px',
                                            mx: 'auto',
                                            mb: 4,
                                            p: { xs: 1.5, md: 1.5 },
                                            pr: { xs: 1.5, md: 2.5 },
                                            borderRadius: '16px',
                                            background: theme.palette.mode === 'dark'
                                                ? 'rgba(10, 132, 255, 0.1)'
                                                : 'rgba(10, 132, 255, 0.05)',
                                            border: '1px solid',
                                            borderColor: theme.palette.mode === 'dark'
                                                ? 'rgba(10, 132, 255, 0.2)'
                                                : 'rgba(10, 132, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: 2,
                                            textAlign: 'left'
                                        }}
                                    >
                                        <Box sx={{ mt: 0.5 }}>
                                            <Psychology fontSize="medium" sx={{ color: '#0a84ff' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#0a84ff', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                AI Learning Strategy
                                            </Typography>
                                            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                                                {aiStrategy}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}
                            {nextRecommendation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '800px',
                                            mx: 'auto',
                                            mb: 6,
                                            p: 3,
                                            borderRadius: '24px',
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)'
                                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
                                            border: '1px solid',
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: { xs: '100%', md: 'auto' },
                                            justifyContent: 'center',
                                            mt: { xs: 1, md: 0 },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 2,
                                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)'
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'left', flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Chip
                                                    label="AI Recommended Next Step"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#6366f1',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                                                {nextRecommendation.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {nextRecommendation.description}
                                            </Typography>
                                        </Box>
                                        <Button
                                            component={Link}
                                            to={nextRecommendation.customLink || `/topic/${nextRecommendation.slug}`}
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowForward />}
                                            sx={{
                                                borderRadius: '9999px',
                                                bgcolor: '#6366f1',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                '&:hover': {
                                                    bgcolor: '#4f46e5',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                                                }
                                            }}
                                        >
                                            Start Learning
                                        </Button>
                                    </Box>
                                </motion.div>
                            )}
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
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(135deg, rgba(94, 92, 230, 0.2) 0%, rgba(94, 92, 230, 0.05) 100%)'
                                                    : 'linear-gradient(135deg, rgba(94, 92, 230, 0.1) 0%, rgba(94, 92, 230, 0.05) 100%)',
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
                                <DashboardHeader user={user} onManagePath={openOnboarding} />
                            </Box>
                        </Box>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Box
                                sx={{
                                    mb: 4,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, px: 3, borderRadius: '9999px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        Current Path:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={700} color="text.primary">
                                        {learningPaths[selectedPath]?.name || 'Unknown Path'}
                                    </Typography>
                                </Box>
                                {selectedPath !== 'all' && (
                                    <Chip
                                        label={`${filteredTopics.length} topics`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#5e5ce620',
                                            color: '#5e5ce6',
                                            fontWeight: 600
                                        }}
                                    />
                                )}
                                <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={() => setShowOnboarding(true)}
                                    sx={{
                                        borderRadius: '9999px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        background: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                                        '&:hover': {
                                            background: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333'
                                        }
                                    }}
                                >
                                    Change Path
                                </Button>
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
                            {selectedPath === 'all' && (
                                <>
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
                                                    slug: 'algorithms',
                                                    categoryCount: 3,
                                                    progress: 0
                                                }}
                                                customLink="/dsa"
                                            />
                                        </motion.div>
                                    </Box>
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
                                </>
                            )}
                            {filteredTopics.filter(t => {
                                if (t.isGroup) return true;
                                const HIDDEN_CHILDREN = [
                                    'algorithms', 'data-structures', 'blind-75', 'dsa',
                                    'operating-systems', 'networking',
                                    'system-design', 'api-design', 'security-engineering', 'reliability-observability', 'caching-performance', 'concurrency', 'concurrency-async',
                                    'testing-strategy', 'devops-basics', 'code-quality', 'product-thinking'
                                ];
                                const CORE_GROUPS = ['algorithms-data-structures', 'cs-fundamentals', 'system-design-architecture', 'engineering-practices'];
                                return !HIDDEN_CHILDREN.includes(t.slug) && !CORE_GROUPS.includes(t.slug);
                            }).map((topic, index) => (
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
                        {topics.length === 0 && !loading && !error && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h5" color="text.secondary">
                                    No topics available yet
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Dashboard;