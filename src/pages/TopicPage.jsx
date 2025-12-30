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

                {/* Tabs for Super Chapters */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {categories.map((category, index) => {
                        const isCompleted = progressMap[category.slug] || false;
                        const isCategoryBookmarked = isBookmarked(category._id);
                        const isExpanded = expandedCategory === category._id;
                        const categorySections = sections.filter(s => s.categoryId === category._id || (s.topicId === topic._id && !s.categoryId)).sort((a, b) => a.order - b.order);

                        const handleToggleCategory = async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newStatus = !isCompleted;

                            try {
                                await progressAPI.toggleCategory(topic.slug, category.slug, newStatus);
                                // Optimistic/Local update for immediate feedback
                                // Ideally we recall fetchAggregateData, but we can also tweak progressMap
                                setProgressMap(prev => ({
                                    ...prev,
                                    [category.slug]: newStatus
                                }));
                                toast.success(newStatus ? 'Category marked completed' : 'Category incomplete');

                                // Invalidate cache
                                localStorage.removeItem(`prephub_topic_agg_${slug}`);
                            } catch (err) {
                                console.error(err);
                                toast.error('Failed to update category');
                            }
                        };

                        const handleCategoryBookmark = (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const result = toggleBookmark({
                                id: category._id,
                                type: 'category',
                                title: category.name,
                                description: category.description,
                                slug: category.slug,
                                topicSlug: topic.slug,
                                categorySlug: category.slug,
                            });

                            if (result.success) {
                                if (result.message === 'Bookmark added') {
                                    toast.success('Category bookmarked');
                                } else {
                                    toast.success('Bookmark removed');
                                }
                                // Force re-render
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
                                        background: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.03)'
                                                : '#fff',
                                        border: '1px solid',
                                        borderColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.05)',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 8px 24px ${topicColor}15`,
                                            borderColor: `${topicColor}40`,
                                        },
                                    }}
                                >
                                    {/* Header Row */}
                                    <Box
                                        onClick={() => navigate(`/topic/${topic.slug}/category/${category.slug}`)}
                                        sx={{
                                            p: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 3,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.02)'
                                                        : 'rgba(0, 0, 0, 0.01)'
                                            }
                                        }}
                                    >
                                        {/* Index Number */}
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

                                        {/* Content */}
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {category.description || `${category.sectionCount || 0} Sections`}
                                                </Typography>
                                                {isCompleted && (
                                                    <Chip
                                                        label="Completed"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '9999px',
                                                            fontWeight: 700,
                                                            fontSize: '0.65rem',
                                                            height: '20px',
                                                            bgcolor: '#30d15820',
                                                            color: '#30d158',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Actions */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {/* Checkbox (Status) */}
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

                                            {/* Expand Arrow (Styled like Play Btn) */}
                                            <Box
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedCategory(isExpanded ? null : category._id);
                                                }}
                                                sx={{
                                                    p: 1,
                                                    bgcolor: isExpanded ? `${topicColor}20` : 'action.hover',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: isExpanded ? `${topicColor}30` : 'action.selected' }
                                                }}
                                            >
                                                <ExpandMore sx={{
                                                    color: topicColor,
                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s'
                                                }} />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Expanded Content (Sections) */}
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <Box sx={{ p: 3, pt: 0, pl: { xs: 3, md: 8 } }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                borderLeft: `2px solid ${topicColor}20`,
                                                pl: 2
                                            }}>
                                                {categorySections.length > 0 ? (
                                                    categorySections.map((section, sIndex) => {
                                                        // Fallback logic for checks, just list item here
                                                        return (
                                                            <Box
                                                                key={section._id}
                                                                component={Link}
                                                                to={`/topic/${topic.slug}/category/${category.slug}/section/${section.slug}`}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 2,
                                                                    p: 1.5,
                                                                    borderRadius: '12px',
                                                                    textDecoration: 'none',
                                                                    color: 'text.primary',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        bgcolor: 'action.hover',
                                                                        transform: 'translateX(4px)',
                                                                        color: topicColor
                                                                    }
                                                                }}
                                                            >
                                                                <PlayCircleOutline sx={{ fontSize: 20, color: topicColor, opacity: 0.7 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {section.title}
                                                                </Typography>
                                                                {section.difficulty && (
                                                                    <Chip
                                                                        label={section.difficulty}
                                                                        size="small"
                                                                        sx={{
                                                                            height: 20,
                                                                            fontSize: '0.7rem',
                                                                            ml: 'auto',
                                                                            bgcolor: section.difficulty === 'beginner' ? '#30d15820' : section.difficulty === 'intermediate' ? '#ff9f0a20' : '#ff453a20',
                                                                            color: section.difficulty === 'beginner' ? '#30d158' : section.difficulty === 'intermediate' ? '#ff9f0a' : '#ff453a',
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        );
                                                    })
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                                        No sections available.
                                                    </Typography>
                                                )}

                                                <Button
                                                    component={Link}
                                                    to={`/topic/${topic.slug}/category/${category.slug}`}
                                                    endIcon={<ArrowForward />}
                                                    sx={{
                                                        mt: 1,
                                                        alignSelf: 'flex-start',
                                                        borderRadius: '9999px',
                                                        textTransform: 'none',
                                                        color: topicColor
                                                    }}
                                                >
                                                    View All Sections & Details
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Collapse>
                                </Card>
                            </motion.div>
                        );
                    })}
                </Box>

                {/* Empty State */}
                {categories.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary">
                            No categories available yet
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default TopicPage;
