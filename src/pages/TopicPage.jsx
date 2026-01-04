import React, { useState, useEffect, useMemo } from 'react';
import CategoryCard from '../components/features/dashboard/CategoryCard';
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
    Download,
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { curriculumAPI, categoryAPI, progressAPI } from '../services/api';
import { isBookmarked, toggleBookmark } from '../utils/bookmarks';
import toast from 'react-hot-toast';
import GlobalLoader from '../components/common/GlobalLoader';
import SafeImage from '../components/common/SafeImage';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import AdaptiveGlass from '../components/common/AdaptiveGlass';

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
    const [bookmarks, setBookmarks] = useState(new Set()); // Added bookmarks state

    // Refresh bookmarks from storage
    const refreshBookmarks = () => {
        const allBookmarks = localStorage.getItem('prephub_bookmarks');
        if (allBookmarks) {
            try {
                const parsed = JSON.parse(allBookmarks);
                setBookmarks(new Set(parsed.map(b => b.id)));
            } catch (e) {
                console.error('Error parsing bookmarks', e);
            }
        } else {
            setBookmarks(new Set());
        }
    };

    // Load bookmarks on mount
    useEffect(() => {
        refreshBookmarks();

        // Listen for storage events to sync across tabs
        const handleStorage = (e) => {
            if (e.key === 'prephub_bookmarks') {
                refreshBookmarks();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const [loading, setLoading] = useState(true);

    // Track experience level from localStorage to refetch when it changes
    const [experienceLevel, setExperienceLevel] = useState(() => {
        try {
            const configStr = localStorage.getItem('prephub_ai_path_config');
            if (configStr) {
                const config = JSON.parse(configStr);
                return config.experienceLevelId || '0-1_year';
            }
        } catch (e) {
            console.error('Error reading experience level', e);
        }
        return '0-1_year';
    });

    useEffect(() => {
        // Update experience level from localStorage (in case it changed)
        try {
            const configStr = localStorage.getItem('prephub_ai_path_config');
            if (configStr) {
                const config = JSON.parse(configStr);
                const newLevel = config.experienceLevelId || '0-1_year';
                if (newLevel !== experienceLevel) {
                    setExperienceLevel(newLevel);
                }
            }
        } catch (e) {
            console.error('Error updating experience level', e);
        }
    }, []);

    useEffect(() => {
        // Fetch data (handles cache internally)
        // Clear cache when experience level changes to force refetch
        const cacheKey = `prephub_topic_agg_${slug}`;
        if (localStorage.getItem(cacheKey)) {
            const cachedData = JSON.parse(localStorage.getItem(cacheKey));
            // Clear cache if experience level changed
            if (cachedData.experienceLevel && cachedData.experienceLevel !== experienceLevel) {
                localStorage.removeItem(cacheKey);
            }
        }

        fetchAggregateData();

        // Refetch when user returns to this page (e.g., after visiting category page)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Refresh topic data when component becomes visible
                fetchAggregateData();
                refreshBookmarks(); // Also refresh bookmarks
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [slug, experienceLevel]);

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
            // 1. Get User Experience Level (needed for API call)
            let experienceLevel = '0-1_year'; // Default to beginner
            try {
                const configStr = localStorage.getItem('prephub_ai_path_config');
                if (configStr) {
                    const config = JSON.parse(configStr);
                    if (config.experienceLevelId) {
                        experienceLevel = config.experienceLevelId;
                    }
                }
            } catch (e) {
                console.error('Error parsing experience config for fetchAggregateData', e);
            }

            if (!localStorage.getItem(cacheKey)) {
                console.log(`[Frontend] Fetching ${slug} for level: ${experienceLevel}`);
                setLoading(true); // Keep original loading behavior
            }

            // Fetch fresh data with experience level param
            const response = await curriculumAPI.getTopicAggregate(slug, { experienceLevel });
            const data = response.data;

            console.log(`[Frontend] Received ${data.categories.length} categories from API`);

            applyAggregateData(data);

            // Save to cache
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

        // 1. Get User Experience Level
        let experienceLevel = '0-1_year'; // Default to beginner
        try {
            const configStr = localStorage.getItem('prephub_ai_path_config');
            if (configStr) {
                const config = JSON.parse(configStr);
                if (config.experienceLevelId) {
                    experienceLevel = config.experienceLevelId;
                }
            }
        } catch (e) {
            console.error('Error parsing experience config', e);
        }

        // 2. Define Exclusion Rules
        const shouldShowCategory = (category) => {
            const group = (category.group || '').toLowerCase();
            const name = (category.name || '').toLowerCase();

            // ALWAYS SHOW basic/fundamental stuff
            if (group.includes('basic') || group.includes('fundament') || group.includes('setup')) return true;

            // CHECK AI CONFIG for specific hide keywords first!
            let aiHideKeywords = [];
            try {
                const configStr = localStorage.getItem('prephub_ai_path_config');
                if (configStr) {
                    const config = JSON.parse(configStr);
                    if (config.hideKeywords && Array.isArray(config.hideKeywords)) {
                        aiHideKeywords = config.hideKeywords.map(k => k.toLowerCase());
                    }
                }
            } catch (e) {
                console.error('Error parsing AI config', e);
            }

            // If AI provided rules, use them!
            if (aiHideKeywords.length > 0) {
                // SAFETY NET: If beginner, force-add "advanced" to the AI's list to be sure
                if (experienceLevel === '0-1_year' && !aiHideKeywords.includes('advanced')) {
                    aiHideKeywords.push('advanced');
                    aiHideKeywords.push('internals');
                    aiHideKeywords.push('architecture');
                }

                // If any keyword matches, hide it
                const shouldHide = aiHideKeywords.some(keyword => group.includes(keyword) || name.includes(keyword));
                return !shouldHide;
            }

            // Fallback Heuristics (Only if AI completely missing)
            if (experienceLevel === '0-1_year') {
                const text = (group + ' ' + name);
                if (text.includes('advance')) return false;
                if (text.includes('architecture')) return false;
                if (text.includes('meta')) return false;
                if (text.includes('internal')) return false;
                return true;
            }

            return true;
        };

        const grouped = categories.reduce((acc, category) => {
            // Apply Filter
            if (!shouldShowCategory(category)) return acc;

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

    // Offline Sync Logic
    const [isOfflineReady, setIsOfflineReady] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Check if topic is already saved offline
        const checkOfflineStatus = async () => {
            if (!topic?.slug) return;
            try {
                // Dynamic import to avoid breaking if db not ready (though it should be)
                const { db } = await import('../db');
                const existing = await db.offline_content.get(topic.slug);
                setIsOfflineReady(!!existing);
            } catch (e) {
                console.error('Failed to check offline status', e);
            }
        };
        checkOfflineStatus();
    }, [topic?.slug]);

    const handleSaveOffline = async () => {
        if (syncing) return;
        setSyncing(true);
        const toastId = toast.loading('Downloading for offline...');

        try {
            const { db } = await import('../db');

            // 1. Fetch full data (already have most of it in topic/categories/sections)
            // But we might want re-fetch to be sure, or just use what we have.
            // Using existing state is faster and cheaper.
            const offlinePayload = {
                slug: topic.slug,
                topic,
                categories,
                sections,
                progressMap,
                updatedAt: new Date().toISOString()
            };

            // 2. Save to Dexie
            await db.offline_content.put(offlinePayload);

            setIsOfflineReady(true);
            toast.success('Saved for offline!', { id: toastId });
        } catch (error) {
            console.error('Offline save failed', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setSyncing(false);
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
            refreshBookmarks(); // Sync state
            toast.success(result.message === 'Bookmark added' ? 'Category bookmarked' : 'Bookmark removed');
        } else {
            toast.error(result.message);
        }
    };



    // Calculate progress based on sections, not categories
    const { totalSections, completedSections, percentage: overallProgress } = progressStats;

    // Use the filtered count for display, so user sees "45 Categories" instead of "68"
    const totalCategories = useMemo(() => {
        return groupedCategories.reduce((acc, [_, groupCats]) => acc + groupCats.length, 0);
    }, [groupedCategories]);

    // const totalCategories = categories.length; // OLD: Raw count
    const completedCategories = categories.filter(cat => progressMap[cat.slug]).length;

    if (loading) {
        return (
            <GlobalLoader fullScreen />
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
                            ? `radial-gradient(circle at top center, ${topicColor}15 0%, ${theme.palette.background.default} 100%)`
                            : `radial-gradient(circle at top center, ${topicColor}08 0%, ${theme.palette.background.default} 100%)`,
                    py: 8,
                    mb: 6,
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid',
                    borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)',
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
                                        : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(255, 255, 255, 0.4)',
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

                        {/* Offline Toggle */}
                        <Button
                            onClick={handleSaveOffline}
                            disabled={syncing || isOfflineReady}
                            startIcon={isOfflineReady ? <CheckCircle /> : <Download />}
                            sx={{
                                mb: 4,
                                ml: 2,
                                borderRadius: '9999px',
                                px: 3,
                                py: 1,
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(255, 255, 255, 0.4)',
                                color: isOfflineReady ? 'success.light' : 'text.primary',
                                textTransform: 'none',
                                '&:hover': {
                                    background: `${topicColor}20`,
                                    borderColor: topicColor,
                                    color: topicColor
                                },
                            }}
                        >
                            {isOfflineReady ? 'Saved Offline' : 'Save for Offline'}
                        </Button>

                        {/* Topic Header */}
                        <AdaptiveGlass
                            intensity="medium"
                            elevation={10}
                            sx={{
                                p: { xs: 3, md: 5 },
                                mb: 6,
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: { xs: 'flex-start', md: 'center' },
                                gap: { xs: 3, md: 5 }
                            }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 80, md: 120 },
                                    height: { xs: 80, md: 120 },
                                    borderRadius: '24px',
                                    background: `linear-gradient(135deg, ${topic.color}20 0%, ${topic.color}10 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid',
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                                    boxShadow: `0 8px 32px ${topic.color}20`,
                                    alignSelf: { xs: 'flex-start', md: 'auto' },
                                    flexShrink: 0
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

                            {/* Topic Info */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        background: `linear-gradient(135deg, ${isDark ? '#fff' : '#000'} 0%, ${topicColor} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        letterSpacing: -1
                                    }}
                                >
                                    {topic.name}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 3, fontSize: '1.2rem', maxWidth: '800px', lineHeight: 1.6 }}
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
                        </AdaptiveGlass>
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
                    {(() => {
                        let globalIndex = 0;
                        return groupedCategories.map(([groupName, groupCategories]) => (
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
                                    {groupCategories.map((category) => {
                                        const currentIndex = globalIndex++;
                                        return (
                                            <motion.div
                                                key={category._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: currentIndex * 0.05 }}
                                            >
                                                <CategoryCard
                                                    category={category}
                                                    topic={{ ...topic, color: topicColor }}
                                                    index={currentIndex}
                                                    isCompleted={progressMap[category.slug]}
                                                    isBookmarked={bookmarks.has(category._id)}
                                                    onToggleStatus={(e) => {
                                                        handleToggleCategory(e, category);
                                                    }}
                                                    onToggleBookmark={(e) => {
                                                        handleCategoryBookmark(e, category);
                                                    }}
                                                    onClick={() => navigate(`/topic/${topic.slug}/category/${category.slug}`)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </Box>

                            </Box>
                        ));
                    })()}

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
