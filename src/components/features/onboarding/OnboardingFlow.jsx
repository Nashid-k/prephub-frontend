import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    IconButton,
    useTheme,
    useMediaQuery,
    Stack
} from '@mui/material';
import {
    CheckCircle,
    ArrowForward,
    Close,
    School,
    Work,
    Code,
    Terminal,
    EmojiEvents,
    TrendingUp,
    Psychology,
    DataObject
} from '@mui/icons-material';

const OnboardingFlow = ({ onComplete }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';

    const [activeStep, setActiveStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const steps = ['Welcome', 'Goal', 'Level', 'Topics', 'Ready'];

    // --- Data Configuration ---
    const goals = [
        { id: 'career', label: 'Career Switch', icon: <Work fontSize="large" />, desc: 'Transition to tech', color: '#34c759' },
        { id: 'skill', label: 'Skill Upgrade', icon: <TrendingUp fontSize="large" />, desc: 'Level up skills', color: '#0a84ff' },
        { id: 'project', label: 'Build Projects', icon: <Code fontSize="large" />, desc: 'Make real apps', color: '#5ac8fa' },
        { id: 'interview', label: 'Interview Prep', icon: <EmojiEvents fontSize="large" />, desc: 'Ace the interview', color: '#ff3b30' },
    ];

    const levels = [
        { id: 'beginner', label: 'Beginner', icon: <School fontSize="large" />, desc: 'Starting from scratch', color: '#32d74b' },
        { id: 'intermediate', label: 'Intermediate', icon: <Terminal fontSize="large" />, desc: 'I know the basics', color: '#ff9f0a' },
        { id: 'advanced', label: 'Advanced', icon: <Psychology fontSize="large" />, desc: 'Expert level', color: '#bf5af2' },
    ];

    const topics = [
        { id: 'mongodb', label: 'MongoDB', icon: '🍃', color: '#00ed64' },
        { id: 'express', label: 'Express.js', icon: '⚡', color: '#ffffff' },
        { id: 'react', label: 'React', icon: '⚛️', color: '#61dafb' },
        { id: 'nodejs', label: 'Node.js', icon: '💚', color: '#8cc84b' },
        { id: 'dsa', label: 'DSA', icon: '🧮', color: '#ff3b30' },
        { id: 'blind75', label: 'Blind 75', icon: '🎯', color: '#ff9f0a' },
        { id: 'system_design', label: 'Sys Design', icon: '🏗️', color: '#bf5af2' },
        { id: 'sql', label: 'SQL', icon: '💾', color: '#007aff' }
    ];

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            localStorage.setItem('prephub_onboarding', JSON.stringify({
                goal: selectedGoal,
                level: selectedLevel,
                topics: selectedTopics,
                completed: true,
                date: new Date().toISOString()
            }));
            onComplete && onComplete();
            navigate(selectedTopics.length > 0 ? `/topic/${selectedTopics[0]}` : '/dashboard');
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    const handleSkip = () => {
        localStorage.setItem('prephub_onboarding', JSON.stringify({ completed: true, skipped: true }));
        onComplete && onComplete();
        navigate('/dashboard');
    };

    const toggleTopic = (topicId) => {
        setSelectedTopics(prev =>
            prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
        );
    };

    const canProceed = () => {
        switch (activeStep) {
            case 0: return true;
            case 1: return selectedGoal !== null;
            case 2: return selectedLevel !== null;
            case 3: return selectedTopics.length > 0;
            case 4: return true;
            default: return false;
        }
    };

    // --- Step Content Renderers ---

    const renderWelcome = () => (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <Typography variant={isMobile ? "h4" : "h2"} sx={{ mb: 2, fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome to PrepHub
                </Typography>
            </motion.div>
            <Typography variant="h6" sx={{ mb: 6, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                Your journey to elite engineering starts now.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, maxWidth: 700, mx: 'auto' }}>
                {[
                    { text: 'AI-Powered Curriculum', icon: <Psychology sx={{ fontSize: 30, color: '#bf5af2' }} /> },
                    { text: 'Interactive Code Studio', icon: <Terminal sx={{ fontSize: 30, color: '#0a84ff' }} /> },
                    { text: 'Real-world Projects', icon: <DataObject sx={{ fontSize: 30, color: '#32d74b' }} /> },
                    { text: 'Interview Mastery', icon: <EmojiEvents sx={{ fontSize: 30, color: '#ff9f0a' }} /> },
                ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}>
                        <Box sx={{
                            p: 3, borderRadius: '20px',
                            bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', gap: 2,
                            backdropFilter: 'blur(10px)'
                        }}>
                            {item.icon}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>{item.text}</Typography>
                        </Box>
                    </motion.div>
                ))}
            </Box>
        </Box>
    );

    const renderCardSelection = (items, selectedId, onSelect) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 2 }}>
            {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card
                        onClick={() => onSelect(item.id)}
                        sx={{
                            cursor: 'pointer',
                            borderRadius: '24px',
                            bgcolor: selectedId === item.id ? `${item.color}20` : 'rgba(255,255,255,0.03)',
                            border: '2px solid',
                            borderColor: selectedId === item.id ? item.color : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { transform: 'translateY(-5px)', bgcolor: 'rgba(255,255,255,0.08)', borderColor: item.color },
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <CardContent sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: `${item.color}20`, color: item.color, display: 'flex' }}>
                                {item.icon}
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>{item.label}</Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</Typography>
                            </Box>
                            {selectedId === item.id && (
                                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                    <CheckCircle sx={{ color: item.color }} />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </Box>
    );

    const renderTopicSelection = () => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 4 }}>
            {topics.map((topic, i) => (
                <motion.div key={topic.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <Chip
                        label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <span>{topic.icon}</span>
                                <Typography sx={{ fontWeight: 600 }}>{topic.label}</Typography>
                            </Stack>
                        }
                        onClick={() => toggleTopic(topic.id)}
                        sx={{
                            height: 48,
                            px: 2,
                            borderRadius: '24px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            bgcolor: selectedTopics.includes(topic.id) ? 'white' : 'rgba(255,255,255,0.05)',
                            color: selectedTopics.includes(topic.id) ? 'black' : 'white',
                            border: '1px solid',
                            borderColor: selectedTopics.includes(topic.id) ? 'white' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.05)', bgcolor: selectedTopics.includes(topic.id) ? 'white' : 'rgba(255,255,255,0.15)' }
                        }}
                    />
                </motion.div>
            ))}
        </Box>
    );

    const renderReady = () => (
        <Box sx={{ textAlign: 'center', py: 6 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                <Box sx={{
                    width: 120, height: 120, borderRadius: '50%', mx: 'auto', mb: 4,
                    background: 'linear-gradient(135deg, #32d74b 0%, #0a84ff 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(10,132,255,0.4)'
                }}>
                    <RocketLaunch sx={{ fontSize: 60, color: 'white' }} />
                </Box>
            </motion.div>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>
                You're All Set!
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
                We've customized your dashboard.
            </Typography>
            <Box sx={{ maxWidth: 400, mx: 'auto', p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {[
                    { label: 'Goal', val: goals.find(g => g.id === selectedGoal)?.label },
                    { label: 'Level', val: levels.find(l => l.id === selectedLevel)?.label },
                ].map((row, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography color="rgba(255,255,255,0.5)">{row.label}</Typography>
                        <Typography fontWeight={600} color="white">{row.val}</Typography>
                    </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="rgba(255,255,255,0.5)">Topics</Typography>
                    <Typography fontWeight={600} color="white">{selectedTopics.length} Selected</Typography>
                </Box>
            </Box>
        </Box>
    );

    // --- Main Render ---

    const getStepTitle = () => {
        if (activeStep === 1) return "What's your main goal?";
        if (activeStep === 2) return "What's your skill level?";
        if (activeStep === 3) return "Pick your interests";
        return "";
    };

    const getStepSubtitle = () => {
        if (activeStep === 1) return "We'll tailor the curriculum to this.";
        if (activeStep === 2) return "Help us find the right starting point.";
        if (activeStep === 3) return "You can change these later.";
        return "";
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#09090b url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 }
        }}>
            {/* Background Orbs */}
            <Box sx={{ position: 'fixed', top: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,132,255,0.2) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.2) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 900, position: 'relative', zIndex: 1 }}
            >
                {/* Progress Bar (Skipped on Step 0/4) */}
                {activeStep > 0 && activeStep < 4 && (
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {steps.slice(1, 4).map((_, i) => (
                            <Box key={i} sx={{
                                width: 40, height: 4, borderRadius: 2,
                                bgcolor: i < activeStep ? 'primary.main' : 'rgba(255,255,255,0.1)'
                            }} />
                        ))}
                    </Box>
                )}

                <Card sx={{
                    borderRadius: '40px',
                    bgcolor: 'rgba(20, 20, 25, 0.7)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)',
                    overflow: 'visible'
                }}>
                    <Box sx={{ p: { xs: 3, md: 6 }, position: 'relative' }}>
                        {/* Skip Button */}
                        <Button
                            onClick={handleSkip}
                            sx={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,0.4)', borderRadius: '20px' }}
                        >
                            Skip
                        </Button>

                        {/* Title Section (Dynamic) */}
                        {activeStep > 0 && activeStep < 4 && (
                            <Box sx={{ textAlign: 'center', mb: 5 }}>
                                <motion.div key={activeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                        {getStepTitle()}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {getStepSubtitle()}
                                    </Typography>
                                </motion.div>
                            </Box>
                        )}

                        {/* Content Area */}
                        <Box sx={{ minHeight: 300 }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeStep === 0 && renderWelcome()}
                                    {activeStep === 1 && renderCardSelection(goals, selectedGoal, setSelectedGoal)}
                                    {activeStep === 2 && renderCardSelection(levels, selectedLevel, setSelectedLevel)}
                                    {activeStep === 3 && renderTopicSelection()}
                                    {activeStep === 4 && renderReady()}
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        {/* Navigation Footer */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                sx={{ color: 'white', opacity: activeStep === 0 ? 0 : 0.6, '&:hover': { opacity: 1 } }}
                            >
                                Back
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                size="large"
                                endIcon={<ArrowForward />}
                                sx={{
                                    borderRadius: '24px', px: 5, py: 1.5,
                                    fontSize: '1.1rem', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)',
                                    boxShadow: '0 8px 30px rgba(10,132,255,0.4)',
                                    opacity: canProceed() ? 1 : 0.5,
                                    '&:hover': { background: 'linear-gradient(135deg, #007aff 0%, #0062cc 100%)', boxShadow: '0 12px 40px rgba(10,132,255,0.6)' }
                                }}
                            >
                                {activeStep === steps.length - 1 ? "Let's Start" : 'Continue'}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </motion.div>
        </Box>
    );
};

export default OnboardingFlow;
