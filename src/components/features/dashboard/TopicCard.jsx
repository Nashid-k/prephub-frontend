import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, IconButton, useTheme } from '@mui/material';
import { TrendingUp, CheckCircle, PlayArrow, MenuBook, ArrowForward } from '@mui/icons-material';
import { getTopicColor, getTopicImage } from '../../../utils/topicMetadata';
import './TopicCard.css';

const TopicCard = (props) => {
    const { topic, reduced = false } = props;
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const progress = topic.progress || 0;
    const topicColor = getTopicColor(topic.slug, isDark);

    if (props.variant === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
            >
                <Card
                    component={Link}
                    to={props.customLink || topic.customLink || `/topic/${topic.slug}`}
                    sx={{
                        textDecoration: 'none',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        gap: 3,
                        borderRadius: '24px',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(255, 255, 255, 0.4)',
                        transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${topicColor}10`,
                            borderColor: `${topicColor}40`,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <img
                            src={getTopicImage(topic.slug)}
                            alt={topic.name}
                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                            {topic.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {topic.description}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        {progress > 0 && (
                            <Box sx={{ width: 100, display: { xs: 'none', md: 'block' } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Progress</Typography>
                                    <Typography variant="caption" color={topicColor} fontWeight={700}>{progress}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: '9999px',
                                        bgcolor: 'action.hover',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: '9999px',
                                            bgcolor: topicColor
                                        }
                                    }}
                                />
                            </Box>
                        )}
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: topicColor
                            }}
                        >
                            <ArrowForward />
                        </Box>
                    </Box>
                </Card>
            </motion.div>
        );
    }

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
                to={props.customLink || topic.customLink || `/topic/${topic.slug}`}
                sx={{
                    textDecoration: 'none',
                    height: '100%',
                    minHeight: { xs: 'auto', md: '340px' },
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '32px',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(30, 30, 30, 0.4)' // More translucent
                            : 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid',
                    borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(255, 255, 255, 0.5)',
                    boxShadow: (theme) =>
                        reduced
                            ? '0 6px 12px rgba(0,0,0,0.06)'
                            : (theme.palette.mode === 'dark'
                                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                                : '0 20px 40px rgba(31, 38, 135, 0.1)'),
                    // Only apply heavy blur on capable devices
                    backdropFilter: reduced ? 'none' : 'blur(30px)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 30px 60px ${topicColor}30`, // Colored glow on hover
                        borderColor: topicColor,
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(30, 30, 30, 0.6)'
                                : 'rgba(255, 255, 255, 0.8)',
                        '& .topic-icon': {
                            transform: 'scale(1.15) rotate(5deg)',
                        },
                        '& .arrow-icon': {
                            transform: 'translateX(8px)',
                        },
                    },
                }}
            >
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

                <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box
                            className="topic-icon"
                            sx={{
                                width: 96,
                                height: 96,
                                flexShrink: 0,
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

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            component="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: 'text.primary',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '32px',
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
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '72px',
                                minHeight: '72px',
                            }}
                        >
                            {topic.description}
                        </Typography>
                    </Box>

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
                                            : 'rgba(0, 0, 0, 0.12)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: '9999px',
                                        background: `linear-gradient(90deg, ${topicColor} 0%, ${topicColor}CC 100%)`,
                                        boxShadow: `0 2px 8px ${topicColor}40`,
                                    },
                                }}
                            />
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mt: 'auto',
                            pt: 2,
                            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : (topicColor === '#F7DF1E' ? '#d4be00' : topicColor),
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

export default React.memo(TopicCard, (prevProps, nextProps) => {
    return (
        prevProps.topic._id === nextProps.topic._id &&
        prevProps.progress === nextProps.progress &&
        prevProps.topic.categoryCount === nextProps.topic.categoryCount &&
        prevProps.topic.sectionCount === nextProps.topic.sectionCount
    );
});
