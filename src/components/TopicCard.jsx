import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, IconButton, useTheme } from '@mui/material';
import { TrendingUp, CheckCircle, PlayArrow, MenuBook, ArrowForward } from '@mui/icons-material';
import './TopicCard.css';

const TopicCard = ({ topic }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const getTopicImage = (slug) => {
        const normalizedSlug = slug?.toLowerCase() || '';
        const imageMap = {
            'mongodb': '/images/topics/mongodb.svg',
            'express': '/images/topics/express.svg',
            'react': '/images/topics/react.png',
            'dsa': '/images/topics/dsa.svg',
            'node': '/images/topics/nodejs.png',
            'nodejs': '/images/topics/nodejs.png',
            'node.js': '/images/topics/nodejs.png',
            'javascript': '/images/topics/javascript.png',
            'typescript': '/images/topics/typescript.png',
            'postgresql': '/images/topics/postgresql.svg',
        };
        return imageMap[normalizedSlug] || '/images/topics/dsa.svg';
    };

    const getTopicColor = (slug) => {
        const normalizedSlug = slug?.toLowerCase() || '';

        // Express: white in dark mode, subtle black in light mode
        if (normalizedSlug === 'express') {
            return isDark ? '#FFFFFF' : '#1a1a1a';
        }

        const colorMap = {
            'mongodb': '#47A248',
            'react': '#61DAFB',
            'dsa': '#FF6B6B',
            'node': '#339933',
            'nodejs': '#339933',
            'javascript': '#F7DF1E',
            'typescript': '#3178C6',
        };
        return colorMap[normalizedSlug] || '#0a84ff';
    };

    const getTextColor = (slug) => {
        return getTopicColor(slug);
    };

    const progress = topic.progress || 0;
    const topicColor = getTopicColor(topic.slug);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -12 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ height: '100%' }}
        >
            <Card
                component={Link}
                to={`/topic/${topic.slug}`}
                sx={{
                    textDecoration: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '32px',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.06)',
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                            : '0 8px 32px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    '&:hover': {
                        boxShadow: `0 24px 64px ${topicColor}40`,
                        borderColor: topicColor,
                        '& .topic-icon': {
                            transform: 'scale(1.15) rotate(5deg)',
                        },
                        '& .arrow-icon': {
                            transform: 'translateX(8px)',
                        },
                    },
                }}
            >
                {/* Gradient Background Accent */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '200px',
                        background: `linear-gradient(135deg, ${topicColor}15 0%, transparent 100%)`,
                        opacity: 0.6,
                        pointerEvents: 'none',
                    }}
                />

                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box
                            className="topic-icon"
                            sx={{
                                width: 96,
                                height: 96,
                                borderRadius: '28px',
                                background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid',
                                borderColor: `${topicColor}40`,
                                boxShadow: `0 8px 32px ${topicColor}30`,
                                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                            }}
                        >
                            <img
                                src={getTopicImage(topic.slug)}
                                alt={topic.name}
                                style={{
                                    width: '60%',
                                    height: '60%',
                                    objectFit: 'contain',
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Title */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            component="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: 'text.primary',
                            }}
                        >
                            {topic.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: '40px',
                            }}
                        >
                            {topic.description}
                        </Typography>
                    </Box>

                    {/* Stats Row */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.5,
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Chip
                            icon={<MenuBook sx={{ fontSize: 16 }} />}
                            label={`${topic.categoryCount || 0} Chapters`}
                            size="small"
                            sx={{
                                borderRadius: '9999px',
                                fontWeight: 600,
                                bgcolor: 'action.hover',
                                fontSize: '0.8rem',
                            }}
                        />
                        {progress > 0 && (
                            <Chip
                                icon={progress === 100 ? <CheckCircle sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
                                label={progress === 100 ? 'Completed' : `${progress}%`}
                                size="small"
                                color={progress === 100 ? 'success' : 'primary'}
                                sx={{
                                    borderRadius: '9999px',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                }}
                            />
                        )}
                    </Box>

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 8,
                                    borderRadius: '9999px',
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.08)'
                                            : 'rgba(0, 0, 0, 0.06)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: '9999px',
                                        background: `linear-gradient(90deg, ${topicColor} 0%, ${topicColor}CC 100%)`,
                                        boxShadow: `0 2px 8px ${topicColor}40`,
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Action Button */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mt: 'auto',
                            pt: 2,
                            color: getTextColor(topic.slug),
                            fontWeight: 600,
                            fontSize: '0.9rem',
                        }}
                    >
                        <span>{progress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                        <ArrowForward
                            className="arrow-icon"
                            sx={{
                                fontSize: 20,
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default TopicCard;
