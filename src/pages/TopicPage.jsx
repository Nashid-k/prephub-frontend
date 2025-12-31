import React, { useState, useEffect, useMemo } from 'react';
import CategoryCard from '../components/CategoryCard';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Button,
    LinearProgress,
    useTheme,
} from '@mui/material';
import {
    ArrowBack,
    Bookmark,
    BookmarkBorder,
    CheckCircle,
    MenuBook,
    ArrowForward,
    ExpandMore,
    ExpandLess,
    PlayCircleOutline,
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { curriculumAPI, categoryAPI, progressAPI } from '../services/api';
import { isBookmarked, toggleBookmark } from '../utils/bookmarks';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import SafeImage from '../components/SafeImage';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';

const TopicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [topic, setTopic] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);

    const [expandedCategory, setExpandedCategory] = useState(null);
    const [progressMap, setProgressMap] = useState({});
    const [progressStats, setProgressStats] = useState({ totalSections: 0, completedSections: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Load from cache first for instant visual
        const cacheKey = `prephub_topic_agg_${slug}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                applyAggregateData(data);
                setLoading(false);
            } catch (e) {
                console.error('Failed to parse cached topic data');
            }
        }

        fetchAggregateData();

        // Refetch when user returns to this page (e.g., after visiting category page)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Refresh topic data when component becomes visible
                fetchAggregateData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [slug]);

    const applyAggregateData = (data) => {
        setTopic(data.topic);
        setCategories(data.categories);
        setSections(data.sections);
        setProgressMap(data.progress);
        if (data.stats) {
            setProgressStats(data.stats);
        }
    };

    const fetchAggregateData = async () => {
        try {
            const cacheKey = `prephub_topic_agg_${slug}`;
            if (!localStorage.getItem(cacheKey)) {
                setLoading(true);
            }

            const response = await curriculumAPI.getTopicAggregate(slug);
            const data = response.data;

            applyAggregateData(data);

            // 2. Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
            console.error('Error fetching topic aggregate:', err);
        } finally {
            setLoading(false);
        }
    };

    const topicColor = getTopicColor(topic?.slug, isDark);

    // Memoize the grouping to prevent calculation on every render
    const groupedCategories = useMemo(() => {
        if (!categories.length) return [];

        const grouped = categories.reduce((acc, category) => {
            const group = category.group || 'General Modules';
            if (!acc[group]) acc[group] = [];
            acc[group].push(category);
            return acc;
        }, {});

        return Object.entries(grouped);
    }, [categories]);

    const handleToggleCategory = async (e, category) => {
        e.preventDefault();
        e.stopPropagation();
        const newStatus = !progressMap[category.slug];
        try {
            await progressAPI.toggleCategory(topic.slug, category.slug, newStatus);
            setProgressMap(prev => ({ ...prev, [category.slug]: newStatus }));
            toast.success(newStatus ? 'Category marked completed' : 'Category incomplete');
            // Optimistic update done, no need to invalidate cache immediately if state is consistent
            localStorage.removeItem(`prephub_topic_agg_${topic.slug}`);
        } catch (err) {
            toast.error('Failed to update category');
        }
    };

    const handleCategoryBookmark = (e, category) => {
        e.preventDefault();
        e.stopPropagation();
        const result = toggleBookmark({
            id: category._id, type: 'category', title: category.name,
            description: category.description, slug: category.slug,
            topicSlug: topic.slug, categorySlug: category.slug,
        });
        if (result.success) {
            toast.success(result.message === 'Bookmark added' ? 'Category bookmarked' : 'Bookmark removed');
            // Force re-render of bookmarks by updating categories (shallow clone to trigger update)
            setCategories([...categories]);
        } else {
            toast.error(result.message);
        }
    };



    // Calculate progress based on sections, not categories
    const { totalSections, completedSections, percentage: overallProgress } = progressStats;
    const totalCategories = categories.length;
    const completedCategories = categories.filter(cat => progressMap[cat.slug]).length;

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl">
                    <LoadingSpinner message="Loading topic..." />
                </Container>
            </Box>
        );
    }

    if (!topic) {
        return (
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Typography variant="h4">Topic not found</Typography>
            </Container>
        );
    }





    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', pb: 6 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? `radial-gradient(ellipse at top, ${topicColor}15 0%, transparent 60%)`
                            : `radial-gradient(ellipse at top, ${topicColor}08 0%, transparent 60%)`,
                    py: 8,
                    mb: 6,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Large Background Logo */}
                <SafeImage
                    src={getTopicImage(topic.slug)}
                    alt=""
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: '400px',
                        height: '400px',
                        opacity: (theme) => theme.palette.mode === 'dark' ? 0.15 : 0.05,
                        pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Back Button */}
                        <Button
                            onClick={() => navigate('/dashboard')}
                            startIcon={<ArrowBack />}
                            sx={{
                                mb: 4,
                                borderRadius: '9999px',
                                px: 3,
                                py: 1,
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(0, 0, 0, 0.03)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(0, 0, 0, 0.08)',
                                color: 'text.primary',
                                textTransform: 'none',
                                '&:hover': {
                                    background: `${topicColor}20`,
                                    borderColor: topicColor,
                                    color: topicColor
                                },
                            }}
                        >
                            Back to Dashboard
                        </Button>

                        {/* Topic Header */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, mb: 4 }}>
                            {/* Topic Icon */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '32px',
                                        background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid',
                                        borderColor: `${topicColor}40`,
                                        boxShadow: `0 12px 40px ${topicColor}30`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <SafeImage
                                        src={getTopicImage(topic.slug)}
                                        alt={topic.name}
                                        sx={{
                                            width: '70%',
                                            height: '70%',
                                            margin: 'auto'
                                        }}
                                    />
                                </Box>
                            </motion.div>

                            {/* Topic Info */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        color: topicColor,
                                        fontSize: { xs: '2rem', md: '3rem' },
                                    }}
                                >
                                    {topic.name}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 3, fontSize: '1.1rem', maxWidth: '800px' }}
                                >
                                    {topic.description}
                                </Typography>

                                {/* Stats */}
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                                    <Chip
                                        icon={<MenuBook />}
                                        label={`${totalCategories} Categories`}
                                        sx={{
                                            borderRadius: '9999px',
                                            fontWeight: 600,
                                            bgcolor: 'action.hover',
                                        }}
                                    />
                                    <Chip
                                        icon={<CheckCircle />}
                                        label={`${completedSections}/${totalSections} Completed`}
                                        sx={{
                                            borderRadius: '9999px',
                                            fontWeight: 700,
                                            bgcolor: overallProgress === 100 ? `${topicColor}20` : 'action.hover',
                                            color: overallProgress === 100 ? topicColor : 'text.secondary',
                                            border: '1px solid',
                                            borderColor: overallProgress === 100 ? `${topicColor}40` : 'transparent',
                                        }}
                                    />
                                </Box>

                                {/* Progress Bar */}
                                <Box sx={{ maxWidth: '600px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            Overall Progress
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: topicColor }}>
                                            {overallProgress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={overallProgress}
                                        sx={{
                                            height: 10,
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
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Categories List */}
            <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        mb: 4,
                        background: `linear-gradient(135deg, ${topicColor} 0%, ${topicColor}CC 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Categories
                </Typography>

                {/* Dynamic Grouping Layout */}
                <Box>
                    {groupedCategories.map(([groupName, groupCategories]) => (
                        <Box key={groupName} sx={{ mb: 6 }}>
                            {/* Group Header - Hide if it's the only group and named 'General Modules' */}
                            {!(groupedCategories.length === 1 && groupName === 'General Modules') && (
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        color: isDark ? 'text.primary' : 'text.secondary',
                                        opacity: 0.9
                                    }}
                                >
                                    <span style={{
                                        width: 8,
                                        height: 24,
                                        backgroundColor: topicColor,
                                        borderRadius: 4,
                                        display: 'inline-block'
                                    }} />
                                    {groupName}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {groupCategories.map((category, index) => (
                                    <CategoryCard
                                        key={category._id}
                                        category={category}
                                        topic={{ ...topic, color: topicColor }}
                                        index={index}
                                        isCompleted={progressMap[category.slug] || false}
                                        isBookmarked={isBookmarked(category._id)}
                                        onToggleStatus={(e) => handleToggleCategory(e, category)}
                                        onToggleBookmark={(e) => handleCategoryBookmark(e, category)}
                                        onClick={() => navigate(`/topic/${topic.slug}/category/${category.slug}`)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h5" color="text.secondary">
                                No categories available yet
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Container >
        </Box >
    );
};

export default TopicPage;
