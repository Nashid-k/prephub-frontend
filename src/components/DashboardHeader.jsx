import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Paper, Avatar, useTheme } from '@mui/material';
import { PlayArrow, EmojiEvents, LocalFireDepartment, Psychology } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStreakData } from '../utils/streakTracker';
import { getTopicImage } from '../utils/topicMetadata';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DashboardHeader = ({ user, onManagePath }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [recommendation, setRecommendation] = useState(null);
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

    useEffect(() => {
        const sData = getStreakData();
        if (sData) setStreak(sData);
        fetchRecommendation();
    }, []);

    const fetchRecommendation = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            if (!token) {
                headers['x-session-id'] = localStorage.getItem('prephub_session_id');
            }

            const response = await axios.get(`${API_URL}/recommendations`, { headers });
            if (response.data && response.data.length > 0) {
                setRecommendation(response.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch recs', err);
        }
    };

    const glassSx = {
        background: isDark ? 'linear-gradient(135deg, rgba(30,30,30,0.6) 0%, rgba(20,20,20,0.4) 100%)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderRadius: '24px',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' }
    };

    return (
        <Box sx={{ mb: 4, mt: 2 }}>
            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={5}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ height: '100%' }}>
                        <Paper sx={{ ...glassSx, background: isDark ? 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)' : '#ffffff' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                        {user?.name ? user.name[0] : 'U'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}!
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ready to continue your journey?
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Button
                                        onClick={() => onManagePath(2)}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Psychology />}
                                        sx={{ borderRadius: '12px', borderColor: 'divider', textTransform: 'none' }}
                                    >
                                        Adjust Difficulty
                                    </Button>
                                    <Button
                                        onClick={() => onManagePath(1)}
                                        variant="text"
                                        size="small"
                                        sx={{ borderRadius: '12px', textTransform: 'none', color: 'text.secondary' }}
                                    >
                                        Change Path
                                    </Button>
                                </Box>

                                <Box sx={{
                                    p: 2, borderRadius: '16px',
                                    bgcolor: isDark ? 'rgba(255,107,53,0.1)' : '#fff5f0',
                                    border: '1px solid', borderColor: 'rgba(255,107,53,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <LocalFireDepartment sx={{ color: '#ff6b35', fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff6b35', lineHeight: 1 }}>
                                                {streak.currentStreak}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#ff6b35', fontWeight: 600 }}>
                                                DAY STREAK
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <EmojiEvents sx={{ color: 'text.disabled', fontSize: 40, opacity: 0.2 }} />
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={7}>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ height: '100%' }}>
                        <Paper sx={{ ...glassSx, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Psychology sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                                        RECOMMENDED NEXT STEP
                                    </Typography>
                                </Box>

                                {recommendation ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Box sx={{
                                            width: 80, height: 80, borderRadius: '20px',
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid', borderColor: 'divider',
                                            flexShrink: 0
                                        }}>
                                            <img
                                                src={getTopicImage(recommendation.slug)}
                                                alt={recommendation.name}
                                                style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {recommendation.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {recommendation.reason}
                                            </Typography>
                                            <Button
                                                component={Link}
                                                to={`/topic/${recommendation.slug}`}
                                                variant="contained"
                                                endIcon={<PlayArrow />}
                                                sx={{ borderRadius: '9999px', textTransform: 'none', fontWeight: 600, px: 3 }}
                                            >
                                                Start Learning
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
                                        <Typography color="text.secondary">All caught up! Explore topics below.</Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{
                                position: 'absolute', right: -50, bottom: -50, width: 200, height: 200,
                                borderRadius: '50%', background: 'linear-gradient(45deg, #5e5ce6 0%, #0a84ff 100%)',
                                opacity: 0.1, filter: 'blur(40px)', pointerEvents: 'none'
                            }} />
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardHeader;
