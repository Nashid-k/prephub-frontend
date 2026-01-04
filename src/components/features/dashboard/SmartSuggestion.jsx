import React from 'react';
import { Box, Paper, Typography, Button, useTheme, Chip } from '@mui/material';
import { PlayArrow, History, ArrowForward, AutoAwesome } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTopicImage, getTopicColor } from '../../../utils/topicMetadata';

const SmartSuggestion = ({ suggestion, type = 'next' }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (!suggestion) return null;

    const isResume = type === 'resume';

    // Normalize data structure
    const topicSlug = suggestion.topicSlug || suggestion.slug || 'default';
    const title = suggestion.title || suggestion.name || 'Unknown Topic';
    const subtitle = suggestion.subtitle || suggestion.description || 'Start your journey';
    const link = suggestion.link || suggestion.customLink || `/topic/${topicSlug}`;

    const topicColor = getTopicColor(topicSlug);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%' }}
        >
            <Paper
                sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '24px',
                    background: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: isResume
                        ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)')
                        : (isDark ? 'rgba(94, 92, 230, 0.3)' : 'rgba(94, 92, 230, 0.2)'),
                    boxShadow: isResume
                        ? 'none'
                        : `0 10px 30px ${isDark ? 'rgba(94, 92, 230, 0.15)' : 'rgba(94, 92, 230, 0.1)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header Label */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {isResume ? (
                        <Chip
                            icon={<History sx={{ fontSize: 16 }} />}
                            label="Pick up where you left off"
                            size="small"
                            sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                        />
                    ) : (
                        <Chip
                            icon={<AutoAwesome sx={{ fontSize: 16 }} />}
                            label="Recommended Next Step"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)', border: 'none' }}
                        />
                    )}
                </Box>

                {/* Content */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flex: 1 }}>
                    {/* Icon */}
                    <Box sx={{
                        width: 64, height: 64,
                        borderRadius: '20px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <img
                            src={getTopicImage(topicSlug)}
                            alt=""
                            style={{ width: '50%', height: '50%', objectFit: 'contain' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </Box>

                    {/* Text Details */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {subtitle}
                        </Typography>
                        {!isResume && suggestion.reason && (
                            <Typography variant="caption" sx={{
                                color: 'primary.main',
                                bgcolor: isDark ? 'rgba(94, 92, 230, 0.1)' : 'rgba(94, 92, 230, 0.05)',
                                px: 1, py: 0.5, borderRadius: '6px', fontWeight: 600
                            }}>
                                💡 {suggestion.reason}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Action Button */}
                <Button
                    component={Link}
                    to={link}
                    variant={isResume ? "outlined" : "contained"}
                    fullWidth
                    size="large"
                    endIcon={isResume ? <ArrowForward /> : <PlayArrow />}
                    sx={{
                        borderRadius: '16px',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        ...(!isResume && {
                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                            boxShadow: '0 4px 12px rgba(94, 92, 230, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4b49cb 0%, #6664d9 100%)',
                                transform: 'translateY(-2px)'
                            }
                        })
                    }}
                >
                    {isResume ? 'Continue Section' : 'Start Lesson'}
                </Button>

                {/* Decorative Background Blob */}
                {!isResume && (
                    <Box sx={{
                        position: 'absolute',
                        top: -50, right: -50,
                        width: 150, height: 150,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                        filter: 'blur(50px)',
                        opacity: 0.15,
                        pointerEvents: 'none'
                    }} />
                )}
            </Paper>
        </motion.div>
    );
};

export default SmartSuggestion;
