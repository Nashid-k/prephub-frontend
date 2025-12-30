import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Chip, Button } from '@mui/material';
import { ArrowForward, Psychology, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RecommendationCard = ({ isDark }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get(`${API_URL}/recommendations`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` || undefined
                }
            });
            setRecommendations(response.data.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || recommendations.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                sx={{
                    borderRadius: '32px',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(94, 92, 230, 0.1) 0%, rgba(90, 200, 250, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(94, 92, 230, 0.05) 0%, rgba(90, 200, 250, 0.05) 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(94, 92, 230, 0.2)',
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #5e5ce6 0%, #5ac8fa 100%)',
                                display: 'flex',
                            }}
                        >
                            <Psychology sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Recommended for You
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Based on your progress
                            </Typography>
                        </Box>
                    </Box>

                    {/* Recommendations List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {recommendations.map((rec, index) => {
                            const topicColor = getTopicColor(rec.slug, isDark);

                            return (
                                <Box
                                    key={rec._id}
                                    component={Link}
                                    to={`/topic/${rec.slug}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: '16px',
                                        bgcolor: 'action.hover',
                                        textDecoration: 'none',
                                        border: '2px solid transparent',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            borderColor: topicColor,
                                            transform: 'translateX(8px)',
                                            bgcolor: `${topicColor}10`,
                                        },
                                    }}
                                >
                                    {/* Topic Icon */}
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid',
                                            borderColor: `${topicColor}40`,
                                        }}
                                    >
                                        <img
                                            src={getTopicImage(rec.slug)}
                                            alt={rec.name}
                                            style={{
                                                width: '60%',
                                                height: '60%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 600,
                                                color: topicColor,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {rec.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {rec.reason}
                                        </Typography>
                                    </Box>

                                    <ArrowForward sx={{ color: topicColor, fontSize: 20 }} />
                                </Box>
                            );
                        })}
                    </Box>

                    {/* View All Button */}
                    <Button
                        component={Link}
                        to="/dashboard"
                        variant="outlined"
                        fullWidth
                        sx={{
                            mt: 3,
                            borderRadius: '9999px',
                            borderWidth: '2px',
                            borderColor: '#5e5ce6',
                            color: '#5e5ce6',
                            '&:hover': {
                                borderWidth: '2px',
                                background: 'rgba(94, 92, 230, 0.1)',
                            },
                        }}
                    >
                        View All Topics
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RecommendationCard;
