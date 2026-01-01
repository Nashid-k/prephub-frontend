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
    Chip
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
    RocketLaunch
} from '@mui/icons-material';
import axios from 'axios';
import { generateSmartPath } from '../utils/SmartCurriculum';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OnboardingModal = ({ open, onComplete, onSkip }) => {
    const theme = useMuiTheme();
    const [step, setStep] = useState(1); // 1: Path, 2: Experience
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const [allTopics, setAllTopics] = useState([]);
    const [pathCounts, setPathCounts] = useState({});

    useEffect(() => {
        if (open) {
            setShowLoading(false);
            setStep(1);
            setSelectedPath(null);
            setSelectedExperience(null);
            fetchTopics();
        }
    }, [open]);

    const fetchTopics = async () => {
        try {
            const response = await axios.get(`${API_URL}/curriculum/topics`);
            setAllTopics(response.data.topics || []);
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        }
    };

    const learningPaths = [
        {
            id: 'new-beginner',
            name: '🌟 I\'m Brand New to Coding',
            description: 'Start from the very basics',
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#34c759',
            duration: '3-4 months',
            detail: 'HTML & CSS → JavaScript → React'
        },
        {
            id: 'mern-fullstack',
            name: '💻 MERN Full Stack',
            description: 'MongoDB, Express, React, Node.js',
            icon: <Code sx={{ fontSize: 40 }} />,
            color: '#0a84ff',
            duration: '8-10 months',
            detail: 'Complete JavaScript stack'
        },
        {
            id: 'mean-fullstack',
            name: '🅰️ MEAN Full Stack',
            description: 'MongoDB, Express, Angular, Node.js',
            icon: <Javascript sx={{ fontSize: 40 }} />,
            color: '#dd0031',
            duration: '8-10 months',
            detail: 'Full stack with Angular'
        },
        {
            id: 'python-fullstack',
            name: '🐍 Python Full Stack',
            description: 'Python, Django, React, PostgreSQL',
            icon: <Language sx={{ fontSize: 40 }} />,
            color: '#3c78d8',
            duration: '6-8 months',
            detail: 'Python-powered development'
        },
        {
            id: 'java-enterprise',
            name: '☕ Java Enterprise',
            description: 'Java, Angular, PostgreSQL',
            icon: <Coffee sx={{ fontSize: 40 }} />,
            color: '#ff9f0a',
            duration: '5-7 months',
            detail: 'Enterprise development'
        },
        {
            id: 'flutter-mobile',
            name: '📱 Mobile Development',
            description: 'Flutter & Dart cross-platform',
            icon: <PhoneAndroid sx={{ fontSize: 40 }} />,
            color: '#5ac8fa',
            duration: '4-6 months',
            detail: 'iOS & Android with one codebase'
        },
        {
            id: 'interview-prep',
            name: '🎯 Interview Preparation',
            description: 'DSA, System Design, CS Fundamentals',
            icon: <EmojiEvents sx={{ fontSize: 40 }} />,
            color: '#ff375f',
            duration: '3-6 months',
            detail: 'Crack FAANG interviews'
        },
        {
            id: 'frontend-specialist',
            name: '🎨 Frontend Specialist',
            description: 'Modern UI development',
            icon: <Palette sx={{ fontSize: 40 }} />,
            color: '#af52de',
            duration: '5-7 months',
            detail: 'UI/UX engineering'
        },
        {
            id: 'backend-specialist',
            name: '⚙️ Backend Specialist',
            description: 'Server-side development',
            icon: <Settings sx={{ fontSize: 40 }} />,
            color: '#ff9500',
            duration: '5-7 months',
            detail: 'APIs & databases'
        },
        {
            id: 'golang-backend',
            name: '🔷 Golang Backend',
            description: 'Go for high-performance systems',
            icon: <Code sx={{ fontSize: 40 }} />,
            color: '#00add8',
            duration: '4-6 months',
            detail: 'Microservices & concurrency'
        },
        {
            id: 'machine-learning-engineer',
            name: '🤖 ML Engineer',
            description: 'AI, Deep Learning & MLOps',
            icon: <Psychology sx={{ fontSize: 40 }} />,
            color: '#FF2D55',
            duration: '6-8 months',
            detail: 'From Math to Deep Learning'
        },
        {
            id: 'data-analyst',
            name: '📊 Data Analyst',
            description: 'SQL, Python, Visualization',
            icon: <Analytics sx={{ fontSize: 40 }} />,
            color: '#FF9500',
            duration: '4-6 months',
            detail: 'Insights from Data'
        },
        {
            id: 'aws-cloud-architect',
            name: '☁️ Cloud Architect',
            description: 'AWS, Security & DevOps',
            icon: <Cloud sx={{ fontSize: 40 }} />,
            color: '#FF9F0A',
            duration: '6-9 months',
            detail: 'Mastering AWS Cloud'
        },
        {
            id: 'csharp-dotnet',
            name: '🔹 C# & .NET',
            description: 'Microsoft enterprise stack',
            icon: <Computer sx={{ fontSize: 40 }} />,
            color: '#68217a',
            duration: '4-5 months',
            detail: 'Enterprise .NET development'
        },
        {
            id: 'systems-programming',
            name: '⚡ Systems Programming',
            description: 'Low-level C programming',
            icon: <Settings sx={{ fontSize: 40 }} />,
            color: '#a8b9cc',
            duration: '4-6 months',
            detail: 'OS internals & performance'
        }
    ];

    const experienceLevels = [
        {
            id: '0-1_year',
            name: '🌱 Beginner (0-1 Year)',
            description: 'Focus on foundations and core concepts.',
            icon: <SignalCellularAlt sx={{ fontSize: 32 }} />,
            color: '#34c759'
        },
        {
            id: '1-3_years',
            name: '🚀 Intermediate (1-3 Years)',
            description: 'Advanced patterns, DSA, and best practices.',
            icon: <TrendingUp sx={{ fontSize: 32 }} />,
            color: '#0a84ff'
        },
        {
            id: '3-5_years',
            name: '🏗️ Advanced (3-5 Years)',
            description: 'System design, scale, and architecture.',
            icon: <RocketLaunch sx={{ fontSize: 32 }} />,
            color: '#bf5af2'
        }
    ];

    useEffect(() => {
        if (allTopics.length > 0) {
            const counts = {};
            learningPaths.forEach(path => {
                const smartPath = generateSmartPath(allTopics, path.id);
                counts[path.id] = smartPath.length;
            });
            setPathCounts(counts);
        }
    }, [allTopics]);

    const handleSelectPath = (path) => {
        setSelectedPath(path);
    };

    const handleContinue = async () => {
        if (step === 1 && selectedPath) {
            setStep(2);
            return;
        }

        if (step === 2 && !selectedExperience) return;

        setShowLoading(true);

        try {
            // Get the default topics for this path with experience filter
            // Note: experienceLevel is passed to generateSmartPath
            const defaultTopics = generateSmartPath(allTopics, selectedPath.id, selectedExperience.id);

            // Call AI to structure them
            const response = await axios.post(`${API_URL}/ai/structure-path`, {
                topics: defaultTopics,
                pathName: selectedPath.name,
                experienceLevel: selectedExperience.name
            });

            if (response.data.success && response.data.structure) {
                // Save AI configuration
                localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                    pathId: selectedPath.id,
                    experienceLevelId: selectedExperience.id,
                    ...response.data.structure
                }));
            }
        } catch (error) {
            console.error('AI Structure failed, falling back to default:', error);
            // Fallback config
            localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                pathId: selectedPath.id,
                experienceLevelId: selectedExperience.id
            }));
        }

        setTimeout(() => {
            onComplete({ ...selectedPath, experienceLevel: selectedExperience });
        }, 1500);
    };

    const handleSkipOnboarding = () => {
        onSkip();
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    maxHeight: '90vh',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <AnimatePresence mode="wait">
                    {!showLoading ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{ p: 4 }}>
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            p: 2.5,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                            mb: 3,
                                            boxShadow: '0 8px 24px rgba(10, 132, 255, 0.4)'
                                        }}
                                    >
                                        {step === 1 ? <School sx={{ fontSize: 48, color: 'white' }} /> : <TrendingUp sx={{ fontSize: 48, color: 'white' }} />}
                                    </Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            mb: 1.5,
                                            background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}
                                    >
                                        {step === 1 ? 'Welcome to PrepHub! 🚀' : 'Select Experience Level'}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                        {step === 1 ? "Let's personalize your learning journey" : `Tailoring ${selectedPath?.name} for you`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {step === 1 ? "Choose your path and we'll show you the right topics" : "We'll adjust the curriculum depth based on your goal."}
                                    </Typography>
                                </Box>

                                <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 1, mb: 3 }}>
                                    {step === 1 ? (
                                        <Grid container spacing={2}>
                                            {learningPaths.map((path, index) => (
                                                <Grid item xs={12} sm={6} key={path.id}>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <Card
                                                            elevation={0}
                                                            sx={{
                                                                height: '100%',
                                                                border: '2px solid',
                                                                borderColor: selectedPath?.id === path.id ? path.color : 'transparent',
                                                                bgcolor: theme.palette.mode === 'dark'
                                                                    ? 'rgba(255,255,255,0.03)'
                                                                    : 'rgba(0,0,0,0.02)',
                                                                transition: 'all 0.3s',
                                                                position: 'relative',
                                                                overflow: 'visible',
                                                                '&:hover': {
                                                                    transform: 'translateY(-4px)',
                                                                    boxShadow: `0 12px 24px ${path.color}30`
                                                                }
                                                            }}
                                                        >
                                                            <CardActionArea onClick={() => setSelectedPath(path)} sx={{ height: '100%', p: 2.5 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                                                    <Box
                                                                        sx={{
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            background: `${path.color}20`,
                                                                            color: path.color,
                                                                            display: 'flex'
                                                                        }}
                                                                    >
                                                                        {path.icon}
                                                                    </Box>
                                                                    {selectedPath?.id === path.id && (
                                                                        <CheckCircle
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: 16,
                                                                                right: 16,
                                                                                color: path.color,
                                                                                fontSize: 28
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                                    {path.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                                                    {path.description}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                    <Chip
                                                                        label={`${pathCounts[path.id] || 0} topics`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: `${path.color}15`,
                                                                            color: path.color,
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        label={path.duration}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </CardActionArea>
                                                        </Card>
                                                    </motion.div>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Grid container spacing={2} justifyContent="center">
                                            {experienceLevels.map((level, index) => (
                                                <Grid item xs={12} sm={4} key={level.id}>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Card
                                                            elevation={0}
                                                            sx={{
                                                                height: '100%',
                                                                border: '2px solid',
                                                                borderColor: selectedExperience?.id === level.id ? level.color : 'transparent',
                                                                bgcolor: theme.palette.mode === 'dark'
                                                                    ? 'rgba(255,255,255,0.03)'
                                                                    : 'rgba(0,0,0,0.02)',
                                                                transition: 'all 0.3s',
                                                                position: 'relative',
                                                                '&:hover': {
                                                                    transform: 'translateY(-4px)',
                                                                    boxShadow: `0 12px 24px ${level.color}30`
                                                                }
                                                            }}
                                                        >
                                                            <CardActionArea onClick={() => setSelectedExperience(level)} sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                                                                <Box
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: '50%',
                                                                        background: `${level.color}20`,
                                                                        color: level.color,
                                                                        display: 'inline-flex',
                                                                        mb: 2
                                                                    }}
                                                                >
                                                                    {level.icon}
                                                                </Box>
                                                                {selectedExperience?.id === level.id && (
                                                                    <CheckCircle
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 16,
                                                                            right: 16,
                                                                            color: level.color,
                                                                            fontSize: 24
                                                                        }}
                                                                    />
                                                                )}
                                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                                    {level.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {level.description}
                                                                </Typography>
                                                            </CardActionArea>
                                                        </Card>
                                                    </motion.div>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={step === 1 ? handleSkipOnboarding : () => setStep(1)}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 4,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
                                        }}
                                    >
                                        {step === 1 ? 'Skip for now' : 'Back'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleContinue}
                                        disabled={step === 1 ? !selectedPath : !selectedExperience}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 5,
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            background: (step === 1 ? selectedPath : selectedExperience)
                                                ? 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)'
                                                : undefined,
                                            '&:disabled': {
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
                                            }
                                        }}
                                    >
                                        {step === 1 ? 'Next' : 'Start Learning 🚀'}
                                    </Button>
                                </Box>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '400px',
                                    p: 6
                                }}
                            >
                                <Box sx={{ position: 'relative', mb: 4 }}>
                                    <CircularProgress
                                        size={80}
                                        thickness={3}
                                        sx={{
                                            color: selectedPath?.color || '#0a84ff',
                                            '& circle': {
                                                strokeLinecap: 'round'
                                            }
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <School sx={{ fontSize: 36, color: selectedPath?.color || '#0a84ff' }} />
                                    </Box>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        background: `linear-gradient(135deg, ${selectedPath?.color || '#0a84ff'} 0%, #5e5ce6 100%)`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Personalizing Your Dashboard...
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                    Setting up your {selectedPath?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedPath?.detail}
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
