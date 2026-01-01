import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Card,
    CardActionArea,
    Grid,
    useTheme as useMuiTheme,
    CircularProgress,
    Chip,
    Stack,
    IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School,
    Code,
    Language,
    Coffee,
    PhoneAndroid,
    EmojiEvents,
    Palette,
    Settings,
    CheckCircle,
    Computer,
    Javascript,
    Psychology,
    Analytics,
    Cloud,
    SignalCellularAlt,
    TrendingUp,
    RocketLaunch,
    ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { generateSmartPath } from '../utils/SmartCurriculum';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Static Data (Moved outside for performance) ---
const LEARNING_PATHS = [
    {
        id: 'new-beginner',
        name: 'Brand New to Coding',
        description: 'Start from absolute scratch. No prior knowledge needed.',
        icon: <School sx={{ fontSize: 32 }} />,
        color: '#34c759',
        duration: '3-4 months',
        detail: 'HTML & CSS → JavaScript → React Basics'
    },
    {
        id: 'mern-fullstack',
        name: 'MERN Full Stack',
        description: 'Master the modern web with Mongo, Express, React, Node.',
        icon: <Code sx={{ fontSize: 32 }} />,
        color: '#0a84ff',
        duration: '8-10 months',
        detail: 'JavaScript Ecosystem Dominance'
    },
    {
        id: 'mean-fullstack',
        name: 'MEAN Full Stack',
        description: 'Enterprise-grade stack with Angular and TypeScript.',
        icon: <Javascript sx={{ fontSize: 32 }} />,
        color: '#dd0031',
        duration: '8-10 months',
        detail: 'Angular & Enterprise Architecture'
    },
    {
        id: 'python-fullstack',
        name: 'Python Full Stack',
        description: 'The power of Python with Django & React.',
        icon: <Language sx={{ fontSize: 32 }} />,
        color: '#3c78d8',
        duration: '6-8 months',
        detail: 'Backend Power with Modern Frontend'
    },
    {
        id: 'java-enterprise',
        name: 'Java Enterprise',
        description: 'Build robust systems with Java Spring Boot.',
        icon: <Coffee sx={{ fontSize: 32 }} />,
        color: '#ff9f0a',
        duration: '5-7 months',
        detail: 'Standard for Large Enterprises'
    },
    {
        id: 'flutter-mobile',
        name: 'Mobile Development',
        description: 'Build iOS and Android apps with Flutter.',
        icon: <PhoneAndroid sx={{ fontSize: 32 }} />,
        color: '#5ac8fa',
        duration: '4-6 months',
        detail: 'Cross-platform Mobile Apps'
    },
    {
        id: 'interview-prep',
        name: 'Interview Prep',
        description: 'Targeted practice for technical interviews.',
        icon: <EmojiEvents sx={{ fontSize: 32 }} />,
        color: '#ff3b30',
        duration: '1-2 months',
        detail: 'DSA & System Design Focus'
    },
    {
        id: 'machine-learning-engineer',
        name: 'AI & Machine Learning',
        description: 'Master Python, ML algorithms, and Neural Networks.',
        icon: <Psychology sx={{ fontSize: 32 }} />,
        color: '#bf5af2', // Purple
        duration: '6-9 months',
        detail: 'From Python to Deep Learning'
    },
    {
        id: 'data-analyst',
        name: 'Data Science & Analytics',
        description: 'Analyze data, visualize trends, and drive decisions.',
        icon: <Analytics sx={{ fontSize: 32 }} />,
        color: '#00d1b2', // Teal
        duration: '4-6 months',
        detail: 'Python, SQL & Data Viz'
    },
    {
        id: 'frontend-specialist',
        name: 'Frontend Specialist',
        description: 'Deep dive into UI/UX, Animations, and Performance.',
        icon: <Palette sx={{ fontSize: 32 }} />,
        color: '#af52de',
        duration: '5-7 months',
        detail: 'Pixel Perfection Engineering'
    },
    {
        id: 'backend-specialist',
        name: 'Backend Specialist',
        description: 'Databases, APIs, Microservices, and Cloud.',
        icon: <Settings sx={{ fontSize: 32 }} />,
        color: '#ff9500',
        duration: '5-7 months',
        detail: 'Scalable Server-Side Logic'
    },
    {
        id: 'golang-backend',
        name: 'Golang Backend',
        description: 'High-performance cloud-native systems.',
        icon: <Code sx={{ fontSize: 32 }} />,
        color: '#00add8',
        duration: '4-6 months',
        detail: 'Concurrency & Microservices'
    },
    {
        id: 'machine-learning-engineer',
        name: 'ML Engineer',
        description: 'From Mathematics to Deep Learning models.',
        icon: <Psychology sx={{ fontSize: 32 }} />,
        color: '#FF2D55',
        duration: '6-8 months',
        detail: 'AI & Data Science'
    },
    {
        id: 'data-analyst',
        name: 'Data Analyst',
        description: 'Uncover insights with Python, SQL, and Visualization.',
        icon: <Analytics sx={{ fontSize: 32 }} />,
        color: '#FF9500',
        duration: '4-6 months',
        detail: 'Data-Driven Decision Making'
    },
    {
        id: 'aws-cloud-architect',
        name: 'Cloud Architect',
        description: 'Master AWS infrastructure, security, and DevOps.',
        icon: <Cloud sx={{ fontSize: 32 }} />,
        color: '#FF9F0A',
        duration: '6-9 months',
        detail: 'AWS Cloud Mastery'
    },
    {
        id: 'csharp-dotnet',
        name: 'C# & .NET',
        description: 'The Microsoft ecosystem for enterprise apps.',
        icon: <Computer sx={{ fontSize: 32 }} />,
        color: '#68217a',
        duration: '4-5 months',
        detail: 'Modern .NET Development'
    },
    {
        id: 'systems-programming',
        name: 'Systems Programming',
        description: 'Low-level C/C++ for OS and performance critical apps.',
        icon: <Settings sx={{ fontSize: 32 }} />,
        color: '#a8b9cc',
        duration: '4-6 months',
        detail: 'Close to the Metal'
    }
];

const EXPERIENCE_LEVELS = [
    {
        id: '0-1_year',
        name: 'Beginner',
        subtitle: '0-1 Years',
        description: 'I need to build a strong foundation. Focus on core concepts and basics.',
        icon: <SignalCellularAlt sx={{ fontSize: 40 }} />,
        color: '#34c759',
        gradient: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)'
    },
    {
        id: '1-3_years',
        name: 'Intermediate',
        subtitle: '1-3 Years',
        description: 'I know the basics. Challenge me with advanced patterns, DSA, and best practices.',
        icon: <TrendingUp sx={{ fontSize: 40 }} />,
        color: '#0a84ff',
        gradient: 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)'
    },
    {
        id: '3-5_years',
        name: 'Advanced',
        subtitle: '3-5 Years',
        description: 'I want deep dives only. System design, architecture, and internals.',
        icon: <RocketLaunch sx={{ fontSize: 40 }} />,
        color: '#bf5af2',
        gradient: 'linear-gradient(135deg, #bf5af2 0%, #af52de 100%)'
    }
];

const OnboardingModal = ({ open, onComplete, onSkip, initialStep = 1, currentPathId = null }) => {
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const [step, setStep] = useState(initialStep);
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const [allTopics, setAllTopics] = useState([]);
    const [pathCounts, setPathCounts] = useState({});

    useEffect(() => {
        if (open) {
            setShowLoading(false);
            // If opening directly to experience (step 2), pre-select current path
            if (initialStep === 2 && currentPathId) {
                const current = LEARNING_PATHS.find(p => p.id === currentPathId);
                setSelectedPath(current);
                setStep(2);
            } else {
                setStep(1);
                setSelectedPath(null);
            }
            setSelectedExperience(null);
            fetchTopics();
        }
    }, [open, initialStep, currentPathId]);

    const fetchTopics = async () => {
        try {
            const response = await axios.get(`${API_URL}/curriculum/topics`);
            setAllTopics(response.data.topics || []);
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        }
    };

    useEffect(() => {
        if (allTopics.length > 0) {
            const counts = {};
            LEARNING_PATHS.forEach(path => {
                const smartPath = generateSmartPath(allTopics, path.id);
                counts[path.id] = smartPath.length;
            });
            setPathCounts(counts);
        }
    }, [allTopics]);

    const handleContinue = async () => {
        // SPECIAL CASE: "Brand New to Coding" skips experience selection
        if (step === 1 && selectedPath) {
            if (selectedPath.id === 'new-beginner') {
                const defaultExperience = EXPERIENCE_LEVELS.find(e => e.id === '0-1_year');
                completeOnboarding(selectedPath, defaultExperience);
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2 && !selectedExperience) return;

        completeOnboarding(selectedPath, selectedExperience);
    };

    const completeOnboarding = async (path, experience) => {
        setShowLoading(true);

        // Min artificial delay for UX feel
        const minDelay = new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Get the default topics for this path with experience filter
            const defaultTopics = generateSmartPath(allTopics, path.id, experience.id);

            // Call AI to structure them (if needed) or just save local config
            // We use a lighter touch here: purely filtering by default, AI enhances if requested later
            // But we simulate "Constructing" for premium feel

            localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                pathId: path.id,
                experienceLevelId: experience.id
            }));

        } catch (error) {
            console.error('Error saving path config:', error);
        }

        await minDelay;
        onComplete({ ...path, experienceLevel: experience });
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '32px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    maxHeight: '90vh',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogContent sx={{ p: 0, height: '650px', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {!showLoading ? (
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Header */}
                            <Box sx={{ p: 4, pb: 2, textAlign: 'center', position: 'relative' }}>
                                {step === 2 && (
                                    <IconButton
                                        onClick={() => setStep(1)}
                                        sx={{ position: 'absolute', left: 24, top: 32 }}
                                    >
                                        <ArrowBack />
                                    </IconButton>
                                )}

                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 1,
                                        background: step === 1
                                            ? 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)'
                                            : `linear-gradient(135deg, ${selectedPath?.color || '#0a84ff'} 0%, #5e5ce6 100%)`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    {step === 1 ? 'Choose Your Goal' : 'Customize Depth'}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 500, mx: 'auto' }}>
                                    {step === 1
                                        ? "Select a track to personalize your learning journey."
                                        : `How deep should we go into ${selectedPath?.name}?`}
                                </Typography>
                            </Box>

                            {/* Content Scroll Area */}
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 4, pt: 2 }}>
                                {step === 1 ? (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'stretch' }}>
                                        {LEARNING_PATHS.map((path, index) => (
                                            <motion.div
                                                key={path.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                style={{ height: '100%', display: 'flex' }}
                                            >
                                                <Card
                                                    elevation={0}
                                                    onClick={() => setSelectedPath(path)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: '24px',
                                                        border: '2px solid',
                                                        borderColor: selectedPath?.id === path.id ? path.color : 'transparent',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                                            transform: 'translateY(-2px)',
                                                            borderColor: selectedPath?.id === path.id ? path.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2.5, height: '100%' }}>
                                                        <Box
                                                            sx={{
                                                                p: 1.5,
                                                                borderRadius: '16px',
                                                                bgcolor: `${path.color}15`,
                                                                color: path.color,
                                                                display: 'flex',
                                                                boxShadow: `0 4px 12px ${path.color}20`
                                                            }}
                                                        >
                                                            {path.icon}
                                                        </Box>
                                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 }}>
                                                                    {path.name}
                                                                </Typography>
                                                                {selectedPath?.id === path.id && (
                                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                        <CheckCircle sx={{ color: path.color, fontSize: 24 }} />
                                                                    </motion.div>
                                                                )}
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.5, fontSize: '0.9rem' }}>
                                                                {path.description}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                                                                <Chip
                                                                    label={path.duration}
                                                                    size="small"
                                                                    sx={{ height: 26, fontSize: '0.75rem', fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                                                />
                                                                {pathCounts[path.id] && (
                                                                    <Chip
                                                                        label={`${pathCounts[path.id]} Topics`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ height: 26, fontSize: '0.75rem', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'grid', gap: 3, maxWidth: 600, mx: 'auto', mt: 2 }}>
                                        {EXPERIENCE_LEVELS.map((level, index) => (
                                            <motion.div
                                                key={level.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Card
                                                    elevation={0}
                                                    onClick={() => setSelectedExperience(level)}
                                                    sx={{
                                                        borderRadius: '24px',
                                                        border: '2px solid',
                                                        borderColor: selectedExperience?.id === level.id ? level.color : 'transparent',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)',
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                            borderColor: selectedExperience?.id === level.id ? level.color : `${level.color}40`
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', p: 3, alignItems: 'center', gap: 3 }}>
                                                        <Box
                                                            sx={{
                                                                width: 72,
                                                                height: 72,
                                                                borderRadius: '20px',
                                                                background: level.gradient,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                boxShadow: `0 8px 24px ${level.color}40`
                                                            }}
                                                        >
                                                            {level.icon}
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                                                    {level.name}
                                                                </Typography>
                                                                <Chip
                                                                    label={level.subtitle}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        bgcolor: `${level.color}20`,
                                                                        color: level.color
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body1" color="text.secondary">
                                                                {level.description}
                                                            </Typography>
                                                        </Box>
                                                        {selectedExperience?.id === level.id && (
                                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                <CheckCircle sx={{ fontSize: 32, color: level.color }} />
                                                            </motion.div>
                                                        )}
                                                    </Box>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {/* Footer Actions */}
                            <Box
                                sx={{
                                    p: 3,
                                    borderTop: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    bgcolor: isDark ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.5)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleContinue}
                                    disabled={step === 1 ? !selectedPath : !selectedExperience}
                                    sx={{
                                        minWidth: 200,
                                        borderRadius: '16px',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        boxShadow: (step === 1 ? selectedPath : selectedExperience)
                                            ? `0 8px 20px ${(step === 1 ? selectedPath?.color : selectedExperience?.color) || '#0a84ff'}40`
                                            : 'none',
                                        background: (step === 1 ? selectedPath : selectedExperience)
                                            ? `linear-gradient(135deg, ${(step === 1 ? selectedPath?.color : selectedExperience?.color) || '#0a84ff'} 0%, #5e5ce6 100%)`
                                            : undefined
                                    }}
                                >
                                    {step === 1 ? 'Next Step' : 'Build My Curriculum 🚀'}
                                </Button>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Box sx={{ position: 'relative', mb: 4 }}>
                                <CircularProgress
                                    size={80}
                                    thickness={3}
                                    sx={{
                                        color: selectedPath?.color || '#0a84ff',
                                        '& circle': { strokeLinecap: 'round' }
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: selectedPath?.color || '#0a84ff',
                                        display: 'flex'
                                    }}
                                >
                                    <School sx={{ fontSize: 32 }} />
                                </Box>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                Constructing Your Path...
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Tailoring <strong>{selectedPath?.name}</strong> for <strong>{selectedExperience?.name}</strong> level.
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
