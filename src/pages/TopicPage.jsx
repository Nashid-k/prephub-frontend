import React, { useState, useEffect } from 'react';
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
                console.log('TopicPage became visible, refreshing data...');
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
                            onClick={() => navigate(-1)}
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
            <Container maxWidth="xl">
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

                {/* Hybrid Layout: Grid for Groups, List for Standard Topics */}
                {['algorithms-data-structures', 'cs-fundamentals', 'system-design-architecture', 'engineering-practices'].includes(topic.slug) ? (
                    <Grid container spacing={3}>
                        {categories.map((category, index) => {
                            const isCompleted = progressMap[category.slug] || false;
                            const isCategoryBookmarked = isBookmarked(category._id);

                            const handleToggleCategory = async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newStatus = !isCompleted;
                                try {
                                    await progressAPI.toggleCategory(topic.slug, category.slug, newStatus);
                                    setProgressMap(prev => ({ ...prev, [category.slug]: newStatus }));
                                    toast.success(newStatus ? 'Category marked completed' : 'Category incomplete');
                                    localStorage.removeItem(`prephub_topic_agg_${topic.slug}`);
                                } catch (err) {
                                    toast.error('Failed to update category');
                                }
                            };

                            const handleCategoryBookmark = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const result = toggleBookmark({
                                    id: category._id, type: 'category', title: category.name,
                                    description: category.description, slug: category.slug,
                                    topicSlug: topic.slug, categorySlug: category.slug,
                                });
                                if (result.success) {
                                    toast.success(result.message === 'Bookmark added' ? 'Category bookmarked' : 'Bookmark removed');
                                    setCategories([...categories]);
                                } else {
                                    toast.error(result.message);
                                }
                            };

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: '24px',
                                                background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fff',
                                                border: '1px solid',
                                                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 12px 30px ${topicColor}20`,
                                                    borderColor: `${topicColor}50`,
                                                },
                                            }}
                                        >
                                            <Box
                                                onClick={() => navigate(`/topic/${topic.slug}/category/${category.slug}`)}
                                                sx={{
                                                    p: 3,
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box
                                                        sx={{
                                                            width: 40, height: 40, borderRadius: '12px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: `${topicColor}15`, color: topicColor,
                                                            fontWeight: 800, fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            onClick={handleCategoryBookmark}
                                                            size="small"
                                                            sx={{ color: isCategoryBookmarked ? topicColor : 'text.disabled' }}
                                                        >
                                                            {isCategoryBookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                                                    {category.name}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {category.description || `${category.sectionCount || 0} Sections`}
                                                </Typography>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', opacity: 0.8 }}>
                                                        {category.sectionCount || 0} Sections
                                                    </Typography>
                                                    <IconButton
                                                        onClick={handleToggleCategory}
                                                        size="small"
                                                        sx={{
                                                            color: isCompleted ? '#30d158' : 'text.disabled',
                                                            bgcolor: isCompleted ? '#30d15815' : 'transparent',
                                                            '&:hover': { bgcolor: '#30d15825', color: '#30d158' }
                                                        }}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    // List Layout for Standard Topics
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {categories.map((category, index) => {
                            const isCompleted = progressMap[category.slug] || false;
                            const isCategoryBookmarked = isBookmarked(category._id);

                            const handleToggleCategory = async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newStatus = !isCompleted;
                                try {
                                    await progressAPI.toggleCategory(topic.slug, category.slug, newStatus);
                                    setProgressMap(prev => ({ ...prev, [category.slug]: newStatus }));
                                    toast.success(newStatus ? 'Category marked completed' : 'Category incomplete');
                                    localStorage.removeItem(`prephub_topic_agg_${topic.slug}`);
                                } catch (err) {
                                    toast.error('Failed to update category');
                                }
                            };

                            const handleCategoryBookmark = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const result = toggleBookmark({
                                    id: category._id, type: 'category', title: category.name,
                                    description: category.description, slug: category.slug,
                                    topicSlug: topic.slug, categorySlug: category.slug,
                                });
                                if (result.success) {
                                    toast.success(result.message === 'Bookmark added' ? 'Category bookmarked' : 'Bookmark removed');
                                    setCategories([...categories]);
                                } else {
                                    toast.error(result.message);
                                }
                            };

                            return (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card
                                        sx={{
                                            borderRadius: '20px',
                                            background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#fff',
                                            border: '1px solid',
                                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 24px ${topicColor}15`,
                                                borderColor: `${topicColor}40`,
                                            },
                                        }}
                                    >
                                        <Box
                                            onClick={() => navigate(`/topic/${topic.slug}/category/${category.slug}`)}
                                            sx={{
                                                p: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 3,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 800,
                                                    color: topicColor,
                                                    opacity: 0.4,
                                                    minWidth: '40px',
                                                    fontFamily: 'monospace'
                                                }}
                                            >
                                                {String(index + 1).padStart(2, '0')}
                                            </Typography>

                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        mb: 0.5,
                                                        color: isCompleted ? 'text.secondary' : 'text.primary',
                                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                                    }}
                                                >
                                                    {category.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {category.description || `${category.sectionCount || 0} Sections`}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton
                                                    onClick={handleToggleCategory}
                                                    sx={{
                                                        color: isCompleted ? '#30d158' : 'text.disabled',
                                                        bgcolor: isCompleted ? '#30d15815' : 'transparent',
                                                        border: '1px solid',
                                                        borderColor: isCompleted ? '#30d15840' : 'rgba(128,128,128,0.2)',
                                                        '&:hover': { bgcolor: '#30d15825', color: '#30d158' }
                                                    }}
                                                >
                                                    <CheckCircle />
                                                </IconButton>

                                                <IconButton
                                                    onClick={handleCategoryBookmark}
                                                    sx={{
                                                        color: isCategoryBookmarked ? topicColor : 'text.disabled',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { color: topicColor, transform: 'scale(1.1)' }
                                                    }}
                                                >
                                                    {isCategoryBookmarked ? <Bookmark /> : <BookmarkBorder />}
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </Box>
                )}
                {/* Empty State */}
                {
                    categories.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h5" color="text.secondary">
                                No categories available yet
                            </Typography>
                        </Box>
                    )
                }
            </Container >
        </Box >
    );
};

export default TopicPage;
