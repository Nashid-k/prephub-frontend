import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Button,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Chip,
    LinearProgress,
} from '@mui/material';
import { CheckCircle, ArrowForward, Close } from '@mui/icons-material';

/**
 * Onboarding Flow Component
 * Guides new users through getting started with PrepHub
 */
const OnboardingFlow = ({ onComplete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const navigate = useNavigate();

    const steps = ['Welcome', 'Your Goal', 'Skill Level', 'Topics', 'Ready!'];

    const goals = [
        { id: 'career', label: 'Career Switch', icon: '💼', desc: 'Transition to web development' },
        { id: 'skill', label: 'Skill Upgrade', icon: '📈', desc: 'Level up current skills' },
        { id: 'project', label: 'Build Projects', icon: '🚀', desc: 'Create real-world apps' },
        { id: 'interview', label: 'Interview Prep', icon: '🎯', desc: 'Ace technical interviews' },
    ];

    const levels = [
        { id: 'beginner', label: 'Beginner', icon: '🌱', desc: 'New to programming' },
        { id: 'intermediate', label: 'Intermediate', icon: '📚', desc: 'Know basics, want to grow' },
        { id: 'advanced', label: 'Advanced', icon: '🚀', desc: 'Experienced developer' },
    ];

    const topics = [
        { id: 'mongodb', label: 'MongoDB', icon: '🍃' },
        { id: 'express', label: 'Express.js', icon: '⚡' },
        { id: 'react', label: 'React', icon: '⚛️' },
        { id: 'nodejs', label: 'Node.js', icon: '💚' },
        { id: 'dsa', label: 'DSA', icon: '🧮' },
        { id: 'blind75', label: 'Blind 75', icon: '🎯' },
    ];

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Save preferences
            localStorage.setItem('prephub_onboarding', JSON.stringify({
                goal: selectedGoal,
                level: selectedLevel,
                topics: selectedTopics,
                completed: true,
                date: new Date().toISOString()
            }));
            onComplete && onComplete();
            // Navigate to first selected topic or dashboard
            if (selectedTopics.length > 0) {
                navigate(`/topic/${selectedTopics[0]}`);
            } else {
                navigate('/dashboard');
            }
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSkip = () => {
        localStorage.setItem('prephub_onboarding', JSON.stringify({ completed: true, skipped: true }));
        onComplete && onComplete();
        navigate('/dashboard');
    };

    const toggleTopic = (topicId) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
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

    const renderStepContent = () => {
        switch (activeStep) {
            case 0: // Welcome
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Welcome to PrepHub! 🎉
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                            Your journey to MERN stack mastery starts here
                        </Typography>
                        <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                                <Typography>Complete curriculum for MongoDB, Express, React & Node</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                                <Typography>AI-powered explanations and code help</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                                <Typography>Interactive code compiler and practice problems</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                                <Typography>Track progress with analytics and spaced repetition</Typography>
                            </Box>
                        </Box>
                    </Box>
                );

            case 1: // Goal
                return (
                    <Box sx={{ py: 3 }}>
                        <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                            What's your main goal?
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                            Help us personalize your learning experience
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {goals.map(goal => (
                                <Card
                                    key={goal.id}
                                    onClick={() => setSelectedGoal(goal.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: selectedGoal === goal.id ? 'primary.main' : 'transparent',
                                        transition: 'all 0.3s',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ mb: 1 }}>{goal.icon}</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {goal.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {goal.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            case 2: // Level
                return (
                    <Box sx={{ py: 3 }}>
                        <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                            What's your current skill level?
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                            Be honest! This helps us recommend the right starting point
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500, mx: 'auto' }}>
                            {levels.map(level => (
                                <Card
                                    key={level.id}
                                    onClick={() => setSelectedLevel(level.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: selectedLevel === level.id ? 'primary.main' : 'transparent',
                                        transition: 'all 0.3s',
                                        '&:hover': { transform: 'translateX(4px)', boxShadow: 3 }
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="h3">{level.icon}</Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {level.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {level.desc}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            case 3: // Topics
                return (
                    <Box sx={{ py: 3 }}>
                        <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                            Which topics interest you?
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                            Select one or more topics to start learning
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                            {topics.map(topic => (
                                <Chip
                                    key={topic.id}
                                    label={`${topic.icon} ${topic.label}`}
                                    onClick={() => toggleTopic(topic.id)}
                                    color={selectedTopics.includes(topic.id) ? 'primary' : 'default'}
                                    variant={selectedTopics.includes(topic.id) ? 'filled' : 'outlined'}
                                    sx={{
                                        fontSize: 18,
                                        py: 3,
                                        px: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                );

            case 4: // Ready
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" sx={{ mb: 2 }}>🚀</Typography>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            You're All Set!
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                            Your personalized learning journey is ready
                        </Typography>
                        <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Your Goal:</strong> {goals.find(g => g.id === selectedGoal)?.label}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Level:</strong> {levels.find(l => l.id === selectedLevel)?.label}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Topics:</strong> {selectedTopics.map(id =>
                                    topics.find(t => t.id === id)?.label
                                ).join(', ')}
                            </Typography>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 3
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: 900 }}
            >
                <Card sx={{ borderRadius: 4, overflow: 'visible' }}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                PrepHub Setup
                            </Typography>
                            <Button onClick={handleSkip} size="small">
                                Skip <Close sx={{ ml: 0.5, fontSize: 16 }} />
                            </Button>
                        </Box>

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map(label => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <LinearProgress
                            variant="determinate"
                            value={(activeStep / (steps.length - 1)) * 100}
                            sx={{ mb: 4, height: 6, borderRadius: 3 }}
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                sx={{ borderRadius: '20px' }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                endIcon={<ArrowForward />}
                                sx={{ borderRadius: '20px', px: 4 }}
                            >
                                {activeStep === steps.length - 1 ? "Let's Go!" : 'Continue'}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </motion.div>
        </Box>
    );
};

export default OnboardingFlow;
