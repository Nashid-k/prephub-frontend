import React, { useState, useEffect } from 'react';
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
    useTheme,
    Grid
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    AutoAwesome,
    Schedule,
    NavigateNext
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { journeyAPI } from '../../../services/api';

/**
 * PathDiscovery - Netflix-style path browsing with AI recommendations
 */
const PathDiscovery = ({
    initialGoal,
    onPathSelected,
    onBack,
    onComplete
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [pathData, setPathData] = useState(null);
    const [selectedPath, setSelectedPath] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [showExperienceSelector, setShowExperienceSelector] = useState(false);

    // Fetch categorized paths
    useEffect(() => {
        const fetchPaths = async () => {
            try {
                setLoading(true);
                const response = await journeyAPI.getPaths(initialGoal);
                setPathData(response.data);
            } catch (error) {
                console.error('Failed to fetch paths:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPaths();
    }, [initialGoal]);

    const handlePathClick = (path) => {
        setSelectedPath(path);
        setShowExperienceSelector(true);
    };

    const handleExperienceClick = (exp) => {
        setSelectedExperience(exp);
    };

    const handleStartLearning = () => {
        if (selectedPath && selectedExperience) {
            // Save to localStorage
            localStorage.setItem('prephub_ai_path_config', JSON.stringify({
                pathId: selectedPath.id,
                experienceLevelId: selectedExperience.id
            }));

            onComplete?.(selectedPath.id, selectedExperience.id);
            navigate('/dashboard');
        }
    };

    const handleBackFromExperience = () => {
        setShowExperienceSelector(false);
        setSelectedPath(null);
        setSelectedExperience(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={40} sx={{ color: '#5e5ce6' }} />
                    <Typography color="text.secondary">Loading paths...</Typography>
                </Stack>
            </Box>
        );
    }

    // Experience selector view
    if (showExperienceSelector && selectedPath) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <Box>
                    <IconButton onClick={handleBackFromExperience} sx={{ mb: 2 }}>
                        <ArrowBack />
                    </IconButton>

                    {/* Selected path header */}
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="h3">{selectedPath.icon}</Typography>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                    {selectedPath.name}
                                </Typography>
                                <Typography color="text.secondary">
                                    {selectedPath.description}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Chip
                                icon={<Schedule sx={{ fontSize: 16 }} />}
                                label={selectedPath.duration}
                                size="small"
                                sx={{ bgcolor: `${selectedPath.color}20`, color: selectedPath.color }}
                            />
                            <Chip
                                label={selectedPath.techStack}
                                size="small"
                                sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                            />
                        </Stack>
                    </Box>

                    {/* Experience question */}
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Your experience with {selectedPath.techStack}?
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        This helps us customize the curriculum depth
                    </Typography>

                    {/* Experience options */}
                    <Stack spacing={2} sx={{ mb: 4 }}>
                        {pathData?.experienceLevels?.map((exp, index) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    onClick={() => handleExperienceClick(exp)}
                                    sx={{
                                        p: 3,
                                        cursor: 'pointer',
                                        borderRadius: '20px',
                                        border: '2px solid',
                                        borderColor: selectedExperience?.id === exp.id
                                            ? selectedPath.color
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                        bgcolor: selectedExperience?.id === exp.id
                                            ? `${selectedPath.color}10`
                                            : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: selectedPath.color,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                                        }
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {exp.name}
                                            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                                                ({exp.subtitle})
                                            </Typography>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {exp.description}
                                        </Typography>
                                    </Box>
                                    {selectedExperience?.id === exp.id && (
                                        <CheckCircle sx={{ color: selectedPath.color, fontSize: 28 }} />
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </Stack>

                    {/* Start button */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleStartLearning}
                        disabled={!selectedExperience}
                        sx={{
                            borderRadius: '16px',
                            py: 2,
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            background: selectedExperience
                                ? `linear-gradient(135deg, ${selectedPath.color} 0%, #0a84ff 100%)`
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                            boxShadow: selectedExperience
                                ? `0 8px 24px ${selectedPath.color}50`
                                : 'none'
                        }}
                    >
                        Start Learning
                    </Button>
                </Box>
            </motion.div>
        );
    }

    // Path discovery grid view
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Box>
                {onBack && (
                    <IconButton onClick={onBack} sx={{ mb: 2 }}>
                        <ArrowBack />
                    </IconButton>
                )}

                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    Choose Your Path
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    {pathData?.totalPaths} paths available • Pick one to start
                </Typography>

                {/* Categories with paths */}
                <Stack spacing={4}>
                    {pathData?.categories?.map((category, catIndex) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.1 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {category.icon} {category.name}
                                </Typography>
                                {category.id === 'recommended' && (
                                    <Chip
                                        icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                                        label="AI Picks"
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(94, 92, 230, 0.15)',
                                            color: '#5e5ce6',
                                            fontWeight: 600
                                        }}
                                    />
                                )}
                            </Stack>

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 1,
                                    scrollSnapType: 'x mandatory',
                                    '&::-webkit-scrollbar': { height: 6 },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                        borderRadius: 3
                                    }
                                }}
                            >
                                {category.paths.map((path, pathIndex) => (
                                    <motion.div
                                        key={path.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ scrollSnapAlign: 'start' }}
                                    >
                                        <Card
                                            onClick={() => handlePathClick(path)}
                                            sx={{
                                                minWidth: 200,
                                                maxWidth: 220,
                                                p: 2.5,
                                                cursor: 'pointer',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                                bgcolor: isDark ? 'rgba(30,30,30,0.4)' : 'rgba(255,255,255,0.8)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: path.color,
                                                    boxShadow: `0 8px 24px ${path.color}30`
                                                }
                                            }}
                                        >
                                            <Typography variant="h3" sx={{ mb: 1 }}>
                                                {path.icon}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {path.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    lineHeight: 1.4,
                                                    minHeight: 40,
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {path.description}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Chip
                                                    label={path.duration}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${path.color}20`,
                                                        color: path.color,
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                                <NavigateNext sx={{ color: 'text.secondary' }} />
                                            </Stack>
                                        </Card>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    ))}
                </Stack>
            </Box>
        </motion.div>
    );
};

export default PathDiscovery;
