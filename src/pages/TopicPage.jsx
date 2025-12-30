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

const TopicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [topic, setTopic] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [progressMap, setProgressMap] = useState({});
    const [progressStats, setProgressStats] = useState({ totalSections: 0, completedSections: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopicData();
        fetchProgressData();
    }, [slug]);

    const fetchTopicData = async () => {
        try {
            setLoading(true);
            const [topicResponse, categoriesResponse] = await Promise.all([
                curriculumAPI.getTopicBySlug(slug),
                categoryAPI.getCategoriesByTopic(slug)
            ]);
            setTopic(topicResponse.data.topic);
            setSections(topicResponse.data.sections || []);
            setCategories(categoriesResponse.data.categories);
        } catch (err) {
            console.error('Error fetching topic:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgressData = async () => {
        try {
            const response = await progressAPI.getTopicProgress(slug);
            setProgressMap(response.data.progress);
            if (response.data.stats) {
                setProgressStats(response.data.stats);
            }
        } catch (err) {
            console.error('Error fetching topic progress:', err);
        }
    };

    // Get topic-specific color
    const getTopicColor = (topicSlug) => {
        const normalizedSlug = topicSlug?.toLowerCase() || '';

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
            'postgresql': '#336791',
        };
        return colorMap[normalizedSlug] || '#5e5ce6';
    };

    const getTopicImage = (topicSlug) => {
        const normalizedSlug = topicSlug?.toLowerCase() || '';
        const imageMap = {
            'mongodb': '/images/topics/mongodb.svg',
            'express': '/images/topics/express.svg',
            'react': '/images/topics/react.png',
            'dsa': '/images/topics/dsa.svg',
            'node': '/images/topics/nodejs.png',
            'nodejs': '/images/topics/nodejs.png',
            'javascript': '/images/topics/javascript.png',
            'typescript': '/images/topics/typescript.png',
            'postgresql': '/images/topics/postgresql.svg',
        };
        return imageMap[normalizedSlug] || '/images/topics/dsa.svg';
    };

    const topicColor = getTopicColor(topic?.slug);

    // Calculate super chapters (groups) for tabs
    const superChapters = React.useMemo(() => {
        const groups = new Set();
        categories.forEach(c => {
            if (c.group && c.group.includes(':')) {
                groups.add(c.group.split(':')[0].trim());
            } else if (c.group && c.group !== 'general' && topic?.slug === 'dsa') {
                groups.add(c.group);
            }
        });
        const sorted = Array.from(groups).sort();
        if (sorted.length > 0) return sorted;
        return [];
    }, [categories, topic]);

    // Filter categories based on active tab
    const filteredCategories = React.useMemo(() => {
        if (activeTab === 'All' || superChapters.length === 0) return categories;
        return categories.filter(c => {
            if (c.group && c.group.includes(':')) {
                return c.group.split(':')[0].trim() === activeTab;
            }
            return c.group === activeTab;
        });
    }, [categories, activeTab, superChapters]);

    // Set default tab to first super chapter if available
    useEffect(() => {
        if (superChapters.length > 0 && (activeTab === 'All' || !superChapters.includes(activeTab))) {
            setActiveTab(superChapters[0]);
        }
    }, [superChapters, activeTab]);

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
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: '400px',
                        height: '400px',
                        opacity: (theme) => theme.palette.mode === 'dark' ? 0.15 : 0.05,
                        pointerEvents: 'none',
                    }}
                >
                    <img
                        src={getTopicImage(topic.slug)}
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                <Container maxWidth="xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Back Button */}
                        <Button
                            component={Link}
                            to="/dashboard"
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
                                        label={`${completedCategories} Completed`}
                                        sx={{
                                            borderRadius: '9999px',
                                            fontWeight: 700,
                                            bgcolor: `${topicColor}20`,
                                            color: topicColor,
                                            border: `2px solid ${topicColor}40`,
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
                {superChapters.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
                        {superChapters.map((chapter) => (
                            <Chip
                                key={chapter}
                                label={chapter}
                                onClick={() => setActiveTab(chapter)}
                                sx={{
                                    borderRadius: '9999px',
                                    fontWeight: 600,
                                    height: 36,
                                    px: 1,
                                    bgcolor: activeTab === chapter ? `${topicColor}20` : 'transparent',
                                    color: activeTab === chapter ? topicColor : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: activeTab === chapter ? topicColor : 'divider',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: activeTab === chapter ? `${topicColor}30` : 'action.hover',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        ))}
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredCategories.map((category, index) => {
                        const isCompleted = progressMap[category.slug] || false;
                        const isCategoryBookmarked = isBookmarked(category._id);
                        const isExpanded = expandedCategory === category._id;
                        const categorySections = sections.filter(s => s.categoryId === category._id || (s.topicId === topic._id && !s.categoryId)).sort((a, b) => a.order - b.order);

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
                                            cursor: 'pointer'
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
                                                onClick={(e) => { e.stopPropagation(); /* Logic for toggle status if needed, but TopicPage usually implies status is derived */ }}
                                                sx={{
                                                    // Preserving visual style but TopicPage status is usually read-only or derived?
                                                    // Actual code checked `isCompleted`. The user said "same check box". Focus on style.
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
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: `${topicColor}30` }
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
                                                        const isSectionCompleted = section.isCompleted; // Need to verify if section object has this? Usually progressMap handles it?
                                                        // Actually TopicPage does not check section completion individually in progressMap?
                                                        // progressMap on TopicPage is { categorySlug: bool }?
                                                        // Let's assume section object returned by getTopicBySlug doesn't have isCompleted populated.
                                                        // We might need to fetch section progress or assume false for now?
                                                        // The user didn't ask for section progress here, just listing.

                                                        return (
                                                            <Box
                                                                key={section._id}
                                                                component={Link}
                                                                to={`/topic/${topic.slug}/section/${section.slug}`}
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
