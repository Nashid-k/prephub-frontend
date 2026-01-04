import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Card,
    useTheme as useMuiTheme,
    Chip,
    Stack,
    IconButton,
    useMediaQuery,
    Fade
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
    ArrowBack,
    AutoAwesome,
    Close
} from '@mui/icons-material';
import axios from 'axios';
import { generateSmartPath } from '../../../utils/SmartCurriculum';
import GlobalLoader from '../../common/GlobalLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Configuration Data ---
const LEARNING_PATHS = [
    {
        id: 'new-beginner',
        name: 'Brand New',
        description: 'Start from 0. No prior knowledge.',
        icon: <School sx={{ fontSize: 28 }} />,
        color: '#34c759',
        duration: '3-4mo',
        detail: 'HTML → CSS → JS'
    },
    {
        id: 'mern-fullstack',
        name: 'MERN Stack',
        description: 'Mongo, Express, React, Node.',
        icon: <Code sx={{ fontSize: 28 }} />,
        color: '#0a84ff',
        duration: '8-10mo',
        detail: 'Full Stack JS'
    },
    {
        id: 'python-fullstack',
        name: 'Python Stack',
        description: 'Django & React power.',
        icon: <Language sx={{ fontSize: 28 }} />,
        color: '#3c78d8',
        duration: '6-8mo',
        detail: 'Modern Web'
    },
    {
        id: 'java-enterprise',
        name: 'Java Ent.',
        description: 'Spring Boot systems.',
        icon: <Coffee sx={{ fontSize: 28 }} />,
        color: '#ff9f0a',
        duration: '5-7mo',
        detail: 'Enterprise Standard'
    },
    {
        id: 'flutter-mobile',
        name: 'Mobile Dev',
        description: 'iOS & Android (Flutter).',
        icon: <PhoneAndroid sx={{ fontSize: 28 }} />,
        color: '#5ac8fa',
        duration: '4-6mo',
        detail: 'Cross-platform'
    },
    {
        id: 'machine-learning-engineer',
        name: 'AI & ML',
        description: 'Python & Neural Networks.',
        icon: <Psychology sx={{ fontSize: 28 }} />,
        color: '#bf5af2',
        duration: '6-9mo',
        detail: 'Future Tech'
    },
    {
        id: 'data-analyst',
        name: 'Data Science',
        description: 'Python, SQL & Viz.',
        icon: <Analytics sx={{ fontSize: 28 }} />,
        color: '#00d1b2',
        duration: '4-6mo',
        detail: 'Data Driven'
    },
    {
        id: 'frontend-specialist',
        name: 'Frontend',
        description: 'UI/UX & Performance.',
        icon: <Palette sx={{ fontSize: 28 }} />,
        color: '#af52de',
        duration: '5-7mo',
        detail: 'Pixel Perfect'
    },
    {
        id: 'backend-specialist',
        name: 'Backend',
        description: 'APIs & Microservices.',
        icon: <Settings sx={{ fontSize: 28 }} />,
        color: '#ff9500',
        duration: '5-7mo',
        detail: 'Scalable Logic'
    },
    {
        id: 'aws-cloud-architect',
        name: 'Cloud Arch.',
        description: 'AWS & DevOps.',
        icon: <Cloud sx={{ fontSize: 28 }} />,
        color: '#FF9F0A',
        duration: '6-9mo',
        detail: 'Infrastructure'
    },
    {
        id: 'golang-backend',
        name: 'Golang',
        description: 'High-perf Cloud Native.',
        icon: <Code sx={{ fontSize: 28 }} />,
        color: '#00add8',
        duration: '4-6mo',
        detail: 'Concurrency'
    },
    {
        id: 'interview-prep',
        name: 'Interview Prep',
        description: 'DSA & System Design.',
        icon: <EmojiEvents sx={{ fontSize: 28 }} />,
        color: '#ff3b30',
        duration: '1-2mo',
        detail: 'Get Hired'
    }
];

const EXPERIENCE_LEVELS = [
    {
        id: '0-1_year',
        name: 'Beginner',
        subtitle: '0-1 Years',
        description: 'Build a strong foundation.',
        icon: <SignalCellularAlt sx={{ fontSize: 32 }} />,
        color: '#34c759'
    },
    {
        id: '1-3_years',
        name: 'Intermediate',
        subtitle: '1-3 Years',
        description: 'Challenge me with patterns.',
        icon: <TrendingUp sx={{ fontSize: 32 }} />,
        color: '#0a84ff'
    },
    {
        id: '3-5_years',
        name: 'Advanced',
        subtitle: '3+ Years',
        description: 'Deep dives & Architecture.',
        icon: <RocketLaunch sx={{ fontSize: 32 }} />,
        color: '#bf5af2'
    }
];

// --- Sub-Components ---

// --- Sub-Components ---

// LoadingSequence moved to src/components/common/GlobalLoader.jsx

const OnboardingModal = ({ open, onComplete, onSkip, initialStep = 1, currentPathId = null }) => {
    const theme = useMuiTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';

    const [step, setStep] = useState(initialStep);
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [allTopics, setAllTopics] = useState([]);

    useEffect(() => {
        if (open) {
            setIsProcessing(false);
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
        } catch (error) { console.error(error); }
    };

    const handleContinue = async () => {
        if (step === 1 && selectedPath) {
            if (selectedPath.id === 'new-beginner') {
                const defaultExp = EXPERIENCE_LEVELS[0];
                handleSubmit(selectedPath, defaultExp);
            } else {
                setStep(2);
            }
        } else if (step === 2 && selectedExperience) {
            handleSubmit(selectedPath, selectedExperience);
        }
    };

    const handleSubmit = async (path, exp) => {
        setIsProcessing(true);
        // Artificial delay for the cool animation sequence
        await new Promise(r => setTimeout(r, 3500));

        try {
            localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                pathId: path.id,
                experienceLevelId: exp.id
            }));
        } catch (e) { console.error(e); }

        if (onComplete) onComplete({ ...path, experienceLevel: exp });
    };

    return (
        <Dialog
            open={open}
            fullScreen={isMobile}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: isDark ? 'rgba(15, 15, 20, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(30px)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: isMobile ? 0 : '32px',
                    boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }
            }}
            TransitionComponent={isMobile ? undefined : Fade}
        >
            <Box sx={{
                height: isMobile ? '100vh' : '650px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                background: isDark
                    ? 'radial-gradient(circle at top left, rgba(10,132,255,0.05), transparent 40%)'
                    : 'radial-gradient(circle at top left, rgba(10,132,255,0.03), transparent 40%)'
            }}>
                {/* Close Button */}
                <IconButton
                    onClick={() => onSkip && onSkip()}
                    sx={{
                        position: 'absolute', right: 16, top: 16, zIndex: 10,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? 'inherit' : 'text.primary'
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>

                {isProcessing ? (
                    <GlobalLoader isDark={isDark} />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        {/* Header Section */}
                        <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 4, md: 5 }, pb: 2, textAlign: 'center' }}>
                            {step === 2 && (
                                <IconButton onClick={() => setStep(1)} sx={{ position: 'absolute', left: 16, top: 16 }}>
                                    <ArrowBack />
                                </IconButton>
                            )}
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <Typography variant={isMobile ? "h4" : "h3"} sx={{
                                    fontWeight: 800,
                                    mb: 1,
                                    background: isDark
                                        ? 'linear-gradient(135deg, #fff 30%, #aaa 100%)'
                                        : 'linear-gradient(135deg, #1a1a1a 30%, #4a4a4a 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {step === 1 ? 'Choose Your Path' : 'Customize Depth'}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
                                    {step === 1 ? 'Where do you want to be in 6 months?' : `How detailed should we make ${selectedPath?.name}?`}
                                </Typography>
                            </motion.div>
                        </Box>

                        {/* Content Grid */}
                        <Box sx={{
                            flex: 1, overflowY: 'auto', px: { xs: 2, md: 6 }, pb: 4,
                            scrollBehavior: 'smooth',
                            '&::-webkit-scrollbar': { display: 'none' } // Hide scrollbar for cleaner look
                        }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {step === 1 ? (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                                            gap: 2
                                        }}>
                                            {LEARNING_PATHS.map((path, i) => (
                                                <Card key={path.id}
                                                    onClick={() => setSelectedPath(path)}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: '20px',
                                                        bgcolor: selectedPath?.id === path.id
                                                            ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                                                            : 'transparent',
                                                        border: '1px solid',
                                                        borderColor: selectedPath?.id === path.id
                                                            ? path.color
                                                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'),
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            borderColor: path.color,
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                                                        },
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                                        <Box sx={{
                                                            p: 1, borderRadius: '12px',
                                                            bgcolor: `${path.color}20`, color: path.color
                                                        }}>
                                                            {path.icon}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                                {path.name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                                {path.duration}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                        {path.description}
                                                    </Typography>
                                                    {selectedPath?.id === path.id && (
                                                        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                                            <CheckCircle sx={{ color: path.color, fontSize: 20 }} />
                                                        </Box>
                                                    )}
                                                </Card>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'grid', gap: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
                                            {EXPERIENCE_LEVELS.map((level, i) => (
                                                <Card key={level.id}
                                                    onClick={() => setSelectedExperience(level)}
                                                    sx={{
                                                        p: 3,
                                                        borderRadius: '24px',
                                                        border: '2px solid',
                                                        borderColor: selectedExperience?.id === level.id
                                                            ? level.color
                                                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'),
                                                        bgcolor: selectedExperience?.id === level.id
                                                            ? `${level.color}10`
                                                            : 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 3,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            borderColor: level.color,
                                                            transform: 'scale(1.02)'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{
                                                        width: 60, height: 60, borderRadius: '18px',
                                                        bgcolor: `${level.color}20`, color: level.color,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {level.icon}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{level.name}</Typography>
                                                            <Chip label={level.subtitle} size="small" sx={{
                                                                height: 20, fontSize: '0.65rem', fontWeight: 700,
                                                                bgcolor: `${level.color}20`, color: level.color
                                                            }} />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {level.description}
                                                        </Typography>
                                                    </Box>
                                                    {selectedExperience?.id === level.id && (
                                                        <CheckCircle sx={{ color: level.color, fontSize: 28 }} />
                                                    )}
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        {/* Footer Action */}
                        <Box sx={{
                            p: 3,
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                            display: 'flex', justifyContent: 'center',
                            bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleContinue}
                                disabled={step === 1 ? !selectedPath : !selectedExperience}
                                sx={{
                                    width: '100%', maxWidth: 400,
                                    borderRadius: '16px',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    background: (step === 1 ? selectedPath : selectedExperience)
                                        ? `linear-gradient(135deg, ${(step === 1 ? selectedPath?.color : selectedExperience?.color) || '#0a84ff'} 0%, #7b2cbf 100%)`
                                        : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                    boxShadow: (step === 1 ? selectedPath : selectedExperience)
                                        ? `0 8px 25px ${(step === 1 ? selectedPath?.color : selectedExperience?.color) || '#0a84ff'}50`
                                        : 'none',
                                    color: (step === 1 ? selectedPath : selectedExperience) ? 'white' : 'text.disabled'
                                }}
                            >
                                {step === 1 ? 'Continue' : 'Create My Plan'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Dialog>
    );
};

export default OnboardingModal;
