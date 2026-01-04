import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Typography,
    Button,
    Card,
    Chip,
    Stack,
    IconButton,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    PlayArrow,
    Explore,
    ArrowForward,
    Close,
    AutoAwesome,
    CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PathDiscovery from './PathDiscovery';

/**
 * JourneyCard - AI-driven inline card for home screen
 * Now with hybrid flow: 1 question → PathDiscovery grid
 */
const JourneyCard = ({
    // Journey data (from useJourney hook)
    journeyData,
    loading,

    // Onboarding state
    isOnboarding,
    onboardingStep,
    onStartOnboarding,
    onAnswerOnboarding,
    onCompleteOnboarding,
    onCancelOnboarding,

    // Callbacks
    onPrimaryAction,
    onSecondaryAction
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    // State for hybrid flow: show PathDiscovery after goal selection
    const [showPathDiscovery, setShowPathDiscovery] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handlePrimaryClick = () => {
        if (onPrimaryAction) {
            onPrimaryAction();
        } else if (journeyData?.context?.activeTopic) {
            navigate(`/topic/${journeyData.context.activeTopic.slug}`);
        } else {
            onStartOnboarding?.();
        }
    };

    const handleSecondaryClick = () => {
        if (onSecondaryAction) {
            onSecondaryAction();
        } else {
            navigate('/dashboard');
        }
    };

    const handleOnboardingAnswer = async (optionId) => {
        // After first question (goal), show PathDiscovery instead of continuing old flow
        if (onboardingStep?.step === 1) {
            setSelectedGoal(optionId);
            setShowPathDiscovery(true);
            return;
        }

        // Fallback for any other steps
        const questionId = 'experience';
        await onAnswerOnboarding?.(questionId, optionId);
    };

    const handlePathComplete = (pathId, experienceId) => {
        // Save preferences via the hook
        onCompleteOnboarding?.(pathId);
    };

    const handleBackFromPathDiscovery = () => {
        setShowPathDiscovery(false);
        setSelectedGoal(null);
    };

    const handleAcceptRecommendation = () => {
        const pathId = onboardingStep?.recommendation?.pathId;
        if (pathId) {
            onCompleteOnboarding?.(pathId);
            navigate('/dashboard');
        }
    };

    // Loading state
    if (loading && !isOnboarding) {
        return (
            <Card
                sx={{
                    p: 4,
                    borderRadius: '24px',
                    bgcolor: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(30px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200
                }}
            >
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={32} sx={{ color: '#5e5ce6' }} />
                    <Typography color="text.secondary">Preparing your journey...</Typography>
                </Stack>
            </Card>
        );
    }

    // Onboarding mode
    if (isOnboarding && onboardingStep) {
        // Show PathDiscovery grid after goal selection
        if (showPathDiscovery) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: '32px',
                            bgcolor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(40px)',
                            boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 80px rgba(0,0,0,0.15)',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <PathDiscovery
                            initialGoal={selectedGoal}
                            onBack={handleBackFromPathDiscovery}
                            onComplete={handlePathComplete}
                        />
                    </Card>
                </motion.div>
            );
        }

        // First question (goal selection)
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: '32px',
                        bgcolor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 80px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Close button */}
                    <IconButton
                        onClick={onCancelOnboarding}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>

                    {/* Progress indicator */}
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                        {[1, 2, 3].map(step => (
                            <Box
                                key={step}
                                sx={{
                                    width: step <= onboardingStep.step ? 40 : 20,
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: step <= onboardingStep.step ? '#5e5ce6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </Stack>

                    {/* Question */}
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        {onboardingStep.question}
                    </Typography>
                    {onboardingStep.subtitle && (
                        <Typography color="text.secondary" sx={{ mb: 4 }}>
                            {onboardingStep.subtitle}
                        </Typography>
                    )}

                    {/* Options or Recommendation */}
                    <AnimatePresence mode="wait">
                        {onboardingStep.type === 'recommendation' ? (
                            <motion.div
                                key="recommendation"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Box
                                    sx={{
                                        p: 4,
                                        borderRadius: '24px',
                                        bgcolor: isDark ? 'rgba(94, 92, 230, 0.1)' : 'rgba(94, 92, 230, 0.08)',
                                        border: '2px solid #5e5ce6',
                                        mb: 3
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                        <AutoAwesome sx={{ color: '#5e5ce6', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                                {onboardingStep.recommendation.pathName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {onboardingStep.recommendation.focus}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Typography sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                        {onboardingStep.recommendation.message}
                                    </Typography>
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleAcceptRecommendation}
                                        startIcon={<CheckCircle />}
                                        sx={{
                                            flex: 1,
                                            borderRadius: '16px',
                                            py: 1.5,
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                            boxShadow: '0 8px 24px rgba(94, 92, 230, 0.4)'
                                        }}
                                    >
                                        Let's do it!
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{
                                            borderRadius: '16px',
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        Show me other options
                                    </Button>
                                </Stack>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`step-${onboardingStep.step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 2
                                    }}
                                >
                                    {onboardingStep.options?.map((option, index) => (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Card
                                                onClick={() => handleOnboardingAnswer(option.id)}
                                                sx={{
                                                    p: 3,
                                                    cursor: 'pointer',
                                                    borderRadius: '20px',
                                                    border: '2px solid',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                                    bgcolor: 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#5e5ce6',
                                                        bgcolor: isDark ? 'rgba(94, 92, 230, 0.1)' : 'rgba(94, 92, 230, 0.05)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h3" sx={{ mb: 1 }}>
                                                    {option.icon}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                    {option.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.description}
                                                </Typography>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        );
    }

    // Normal journey card (greeting + actions)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                {/* Path chip */}
                {journeyData?.context?.pathName && (
                    <Chip
                        icon={<AutoAwesome sx={{ fontSize: 16 }} />}
                        label={journeyData.context.pathName}
                        size="small"
                        sx={{
                            mb: 2,
                            bgcolor: 'rgba(94, 92, 230, 0.15)',
                            color: '#5e5ce6',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            border: '1px solid rgba(94, 92, 230, 0.25)',
                            px: 1
                        }}
                    />
                )}

                {/* Greeting */}
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 800,
                        mb: 2,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        fontSize: { xs: '2rem', md: '3rem' }
                    }}
                >
                    {journeyData?.greeting || 'Hey there!'}
                </Typography>

                {/* Message */}
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        maxWidth: '600px',
                        mb: 4,
                        fontWeight: 400,
                        fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                >
                    {journeyData?.message || "Ready to start your coding journey?"}
                </Typography>

                {/* Actions */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={handlePrimaryClick}
                        sx={{
                            borderRadius: '16px',
                            px: 4,
                            py: 1.5,
                            bgcolor: '#fff',
                            color: '#000',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                    >
                        {journeyData?.primaryAction?.label || 'Start Journey'}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Explore />}
                        onClick={handleSecondaryClick}
                        sx={{
                            borderRadius: '16px',
                            px: 4,
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: 'text.primary',
                            '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                        }}
                    >
                        {journeyData?.secondaryAction?.label || 'Explore'}
                    </Button>
                </Stack>
            </Box>
        </motion.div>
    );
};

export default JourneyCard;
