import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumAPI, progressAPI } from '../services/api';
import { isBookmarked, toggleBookmark } from '../utils/bookmarks';
import SafeImage from '../components/common/SafeImage';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import toast from 'react-hot-toast';
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
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    ArrowBack,
    CheckCircle,
    PlayArrow,
    Bookmark,
    BookmarkBorder,
    EmojiEvents,
    MenuBook,
    School,
    AccessTime,
    FilterList
} from '@mui/icons-material';
import GlobalLoader from '../components/common/GlobalLoader';

const CategoryPage = () => {
    const { topicSlug, categorySlug } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [, setBookmarkUpdate] = useState(0); // Forcing re-render on bookmark toggle

    const [category, setCategory] = useState(null);
    const [sections, setSections] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState(null);
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    const topicColor = getTopicColor(topicSlug);

    useEffect(() => {
        // 1. Load from cache first for instant UI
        const cacheKey = `prephub_category_agg_${topicSlug}_${categorySlug}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                applyAggregateData(data);
                setLoading(false);
            } catch (e) {
                console.error('Failed to parse cached category data');
            }
        }

        fetchAggregateData();
    }, [topicSlug, categorySlug]);

    const applyAggregateData = (data) => {
        setCategory(data.category);
        setSections(data.sections);
        setTopic(data.topic);
        setProgressMap(data.progress || {});
    };

    const fetchAggregateData = async () => {
        try {
            const cacheKey = `prephub_category_agg_${topicSlug}_${categorySlug}`;
            if (!localStorage.getItem(cacheKey)) {
                setLoading(true);
            }

            const response = await curriculumAPI.getCategoryAggregate(topicSlug, categorySlug);
            const data = response.data;

            applyAggregateData(data);

            // 2. Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
            console.error('Error fetching category aggregate:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBookmark = () => {
        if (!category) return;
        const result = toggleBookmark({
            id: category._id,
            type: 'category',
            title: category.name,
            description: category.description,
            slug: category.slug,
            topicSlug: topicSlug,
            group: category.group
        });
        if (result.success) {
            toast.success(result.message);
            setBookmarkUpdate(prev => prev + 1);
        } else {
            toast.error(result.message);
        }
    };

    const handleToggleProgress = async (e, sectionSlug) => {
        e.preventDefault();
        e.stopPropagation();
        const currentStatus = progressMap[sectionSlug] || false;
        const newStatus = !currentStatus;

        // Optimistic update
        setProgressMap(prev => ({ ...prev, [sectionSlug]: newStatus }));

        try {
            await progressAPI.toggleProgress(topicSlug, sectionSlug, newStatus);

            // Update the cache with the new progress
            const cacheKey = `prephub_category_agg_${topicSlug}_${categorySlug}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const data = JSON.parse(cachedData);
                    data.progress = { ...data.progress, [sectionSlug]: newStatus };
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (e) {
                    console.error('Failed to update cache');
                }
            }

            // Also invalidate related caches for consistency
            localStorage.removeItem(`prephub_topic_agg_${topicSlug}`);
            localStorage.removeItem('prephub_global_progress');
            localStorage.removeItem('prephub_topics');
        } catch (err) {
            console.error('Failed to toggle progress:', err);
            // Revert on error
            setProgressMap(prev => ({ ...prev, [sectionSlug]: currentStatus }));
        }
    };

    const handleToggleCategoryProgress = async () => {
        const newStatus = !allStudied; // Toggle based on current aggregate state

        // Optimistic update for ALL sections
        const newProgressMap = { ...progressMap };
        sections.forEach(s => {
            newProgressMap[s.slug] = newStatus;
        });
        setProgressMap(newProgressMap);

        try {
            await progressAPI.toggleCategory(topicSlug, categorySlug, newStatus);
            toast.success(newStatus ? 'Category marked as completed' : 'Category marked as incomplete');

            // Update the cache
            const cacheKey = `prephub_category_agg_${topicSlug}_${categorySlug}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const data = JSON.parse(cachedData);
                    // Update all sections in cache
                    if (!data.progress) data.progress = {};
                    sections.forEach(s => {
                        data.progress[s.slug] = newStatus;
                    });
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (e) {
                    console.error('Failed to update cache');
                }
            }

            // Invalidate parent caches
            localStorage.removeItem(`prephub_topic_agg_${topicSlug}`);
            localStorage.removeItem('prephub_global_progress');
        } catch (err) {
            console.error('Failed to toggle category progress:', err);
            toast.error('Failed to update category progress');
            // Revert is complex here, simpler to utilize fetchAggregateData or just revert the map if we stored previous
            // For now, let's just re-fetch in case of error to stay consistent
            fetchAggregateData();
        }
    };

    // Memoize expensive calculation to prevent recalculation on every render
    const allStudied = React.useMemo(() => {
        return sections.length > 0 && sections.every(s => progressMap[s.slug]);
    }, [sections, progressMap]);

    if (loading) return <GlobalLoader fullScreen />;
    if (!category) return <Typography>Category not found</Typography>;

    return (
        <Box sx={{
            minHeight: '100vh',
            pt: { xs: 10, md: 14 },
            pb: 6,
            background: isDark ? 'linear-gradient(180deg, #09090b 0%, #18181b 100%)' : '#f8fafc',
            color: 'text.primary',
        }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(`/topic/${topicSlug}`)}
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
                        Back
                    </Button>

                    <Box sx={{
                        p: 4,
                        borderRadius: '24px',
                        background: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(31, 38, 135, 0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="overline" sx={{ color: topicColor, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                        {category.group || 'CATEGORY'}
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: isDark ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.75rem', md: '3rem' }, flexWrap: 'wrap' }}>
                                        {category.name}
                                        {allStudied && <EmojiEvents sx={{ color: '#FFD700', fontSize: { xs: 24, md: 32 } }} />}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '800px', lineHeight: 1.7, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        {category.description}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={handleToggleBookmark}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '16px',
                                        color: isBookmarked(category._id) ? topicColor : 'text.secondary',
                                        bgcolor: isBookmarked(category._id) ? `${topicColor}15` : 'transparent',
                                        border: '1px solid',
                                        borderColor: isBookmarked(category._id) ? `${topicColor}40` : 'rgba(128,128,128,0.2)',
                                        '&:hover': { bgcolor: `${topicColor}15` },
                                        flexShrink: 0
                                    }}
                                >
                                    {isBookmarked(category._id) ? <Bookmark /> : <BookmarkBorder />}
                                </IconButton>
                            </Box>

                            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<School sx={{ fontSize: 16 }} />}
                                    label={`${sections.length} Sections`}
                                    sx={{ bgcolor: `${topicColor}15`, color: topicColor, fontWeight: 600 }}
                                />
                                <Chip
                                    icon={allStudied ? <CheckCircle sx={{ fontSize: 16 }} /> : <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor' }} />}
                                    label={allStudied ? "Completed" : "Mark Complete"}
                                    onClick={handleToggleCategoryProgress}
                                    sx={{
                                        bgcolor: allStudied ? '#30d15820' : 'transparent',
                                        color: allStudied ? '#30d158' : 'text.secondary',
                                        fontWeight: 600,
                                        border: allStudied ? 'none' : '1px solid',
                                        borderColor: 'text.disabled',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: allStudied ? '#30d15830' : 'action.hover'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Decorative Gradient Blob */}
                        <Box sx={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            background: topicColor,
                            filter: 'blur(100px)',
                            opacity: 0.1,
                            pointerEvents: 'none',
                            zIndex: 0
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            opacity: 0.08,
                            pointerEvents: 'none',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 0
                        }}>
                            <SafeImage
                                src={getTopicImage(topicSlug)}
                                alt=""
                                sx={{
                                    width: '150px',
                                    height: '150px',
                                    filter: 'grayscale(100%)',
                                    transform: 'translate(25%, 25%)'
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Sections List */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, px: 1, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Sections
                        </Typography>

                        {/* Difficulty Filter */}
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
                            <InputLabel>Filter Level</InputLabel>
                            <Select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                label="Filter Level"
                                sx={{ borderRadius: '9999px' }}
                            >
                                <MenuItem value="all">All Levels</MenuItem>
                                <MenuItem value="beginner">Beginner</MenuItem>
                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                <MenuItem value="advanced">Advanced</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sections
                            .filter(section => difficultyFilter === 'all' || section.difficulty === difficultyFilter)
                            .map((section, index) => {
                                const isCompleted = progressMap[section.slug];
                                const sectionBookmarked = isBookmarked(section._id);

                                return (
                                    <Box key={section._id}>
                                        <Card
                                            onClick={() => navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${section.slug}`)}
                                            sx={{
                                                borderRadius: '24px',
                                                background: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
                                                backdropFilter: 'blur(30px)',
                                                border: '1px solid',
                                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                                                boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(31, 38, 135, 0.05)',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 20px 40px ${topicColor}20`,
                                                    borderColor: `${topicColor}40`,
                                                    background: isDark ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.8)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, md: 3 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: { xs: '100%', sm: 'auto' }, mb: { xs: 1, sm: 0 } }}>
                                                    {/* Index Number */}
                                                    <Typography variant="h4" sx={{
                                                        fontWeight: 800,
                                                        color: isCompleted ? '#30d158' : 'text.disabled',
                                                        opacity: 0.3,
                                                        minWidth: '40px',
                                                        fontSize: { xs: '1.5rem', md: '2.125rem' }
                                                    }}>
                                                        {String(index + 1).padStart(2, '0')}
                                                    </Typography>

                                                    {/* Content Mobile View - Merged here for simpler columnar layout if needed, but keeping separate for now */}
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ flex: 1, width: '100%' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 700,
                                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                                            opacity: isCompleted ? 0.6 : 1,
                                                            fontSize: { xs: '1rem', md: '1.25rem' }
                                                        }}>
                                                            {section.title}
                                                        </Typography>
                                                        {/* Difficulty Badge */}
                                                        <Chip
                                                            label={section.difficulty || 'beginner'}
                                                            size="small"
                                                            sx={{
                                                                height: '20px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                                textTransform: 'capitalize',
                                                                borderRadius: '9999px',
                                                                bgcolor: section.difficulty === 'advanced' ? '#ff453a15' :
                                                                    section.difficulty === 'intermediate' ? '#ff9f0a15' :
                                                                        '#30d15815',
                                                                color: section.difficulty === 'advanced' ? '#ff453a' :
                                                                    section.difficulty === 'intermediate' ? '#ff9f0a' :
                                                                        '#30d158',
                                                                border: '1px solid',
                                                                borderColor: section.difficulty === 'advanced' ? '#ff453a40' :
                                                                    section.difficulty === 'intermediate' ? '#ff9f0a40' :
                                                                        '#30d15840',
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                                                        {section.description}
                                                    </Typography>
                                                </Box>

                                                {/* Actions */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' }, mt: { xs: 1, sm: 0 } }}>
                                                    <IconButton
                                                        onClick={(e) => handleToggleProgress(e, section.slug)}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmark({
                                                                id: section._id,
                                                                type: 'section',
                                                                title: section.title,
                                                                description: section.description,
                                                                slug: section.slug,
                                                                categorySlug: categorySlug,
                                                                topicSlug: topicSlug,
                                                                difficulty: section.difficulty
                                                            });
                                                            setBookmarkUpdate(prev => prev + 1);
                                                        }}
                                                        sx={{
                                                            color: sectionBookmarked ? topicColor : 'text.disabled',
                                                            '&:hover': { color: topicColor }
                                                        }}
                                                    >
                                                        {sectionBookmarked ? <Bookmark /> : <BookmarkBorder />}
                                                    </IconButton>

                                                    <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <PlayArrow sx={{ color: topicColor }} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Box>
                                );
                            })}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default CategoryPage;
