import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
} from '@mui/material';
import { Delete, DeleteSweep, Bookmark as BookmarkIcon, ArrowForward, FilterList } from '@mui/icons-material';
import { getBookmarks, removeBookmark, clearAllBookmarks } from '../utils/bookmarks';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import toast from 'react-hot-toast';

const BookmarksPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = () => {
        const allBookmarks = getBookmarks();
        setBookmarks(allBookmarks);
    };

    const handleRemoveBookmark = (itemId) => {
        const result = removeBookmark(itemId);
        if (result.success) {
            toast.success('Bookmark removed');
            loadBookmarks();
        } else {
            toast.error(result.message);
        }
    };

    const handleClearAll = () => {
        const result = clearAllBookmarks();
        if (result.success) {
            toast.success('All bookmarks cleared');
            loadBookmarks();
            setClearDialogOpen(false);
        } else {
            toast.error(result.message);
        }
    };

    const handleNavigate = (bookmark) => {
        if (bookmark.type === 'topic') {
            navigate(`/topic/${bookmark.slug}`);
        } else if (bookmark.type === 'category') {
            navigate(`/topic/${bookmark.topicSlug}/category/${bookmark.slug}`);
        } else if (bookmark.type === 'section') {
            navigate(`/topic/${bookmark.topicSlug}/category/${bookmark.categorySlug}/section/${bookmark.slug}`);
        }
    };

    const filteredBookmarks = filter === 'all'

    const filteredBookmarks = filter === 'all'
        ? bookmarks
        : bookmarks.filter(b => b.type === filter);

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'topic', label: 'Topics' },
        { value: 'category', label: 'Categories' },
        { value: 'section', label: 'Sections' },
    ];

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', pb: 6 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.15) 0%, transparent 60%)'
                            : 'radial-gradient(ellipse at top, rgba(94, 92, 230, 0.08) 0%, transparent 60%)',
                    py: 8,
                    mb: 6,
                }}
            >
                <Container maxWidth="xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                            <Box>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: { xs: '2rem', md: '3rem' },
                                    }}
                                >
                                    📚 My Bookmarks
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                                    {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
                                </Typography>
                            </Box>
                            {bookmarks.length > 0 && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteSweep />}
                                    onClick={() => setClearDialogOpen(true)}
                                    sx={{
                                        borderRadius: '9999px',
                                        px: 3,
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderWidth: '2px',
                                        },
                                    }}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Filter Chips */}
                {bookmarks.length > 0 && (
                    <Box sx={{ mb: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FilterList sx={{ color: 'text.secondary' }} />
                        {filterOptions.map((option) => (
                            <Chip
                                key={option.value}
                                label={option.label}
                                onClick={() => setFilter(option.value)}
                                sx={{
                                    borderRadius: '9999px',
                                    fontWeight: 600,
                                    px: 1,
                                    background: filter === option.value
                                        ? 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)'
                                        : 'transparent',
                                    color: filter === option.value ? 'white' : 'text.primary',
                                    border: '2px solid',
                                    borderColor: filter === option.value ? '#5e5ce6' : 'rgba(94, 92, 230, 0.3)',
                                    '&:hover': {
                                        background: filter === option.value
                                            ? 'linear-gradient(135deg, #7d7bf0 0%, #9d9bf8 100%)'
                                            : 'rgba(94, 92, 230, 0.1)',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Bookmarks Grid */}
                {filteredBookmarks.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredBookmarks.map((bookmark, index) => {
                            const topicColor = getTopicColor(bookmark.topicSlug, isDark);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={bookmark.id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        whileHover={{ y: -12 }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card
                                            onClick={() => handleNavigate(bookmark)}
                                            sx={{
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
                                                cursor: 'pointer',
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                '&:hover': {
                                                    boxShadow: `0 24px 64px ${topicColor}40`,
                                                    borderColor: topicColor,
                                                    '& .bookmark-bg-image': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        opacity: 0.4,
                                                    },
                                                    '& .bookmark-arrow': {
                                                        transform: 'translateX(8px)',
                                                    },
                                                },
                                            }}
                                        >
                                            {/* Background Image */}
                                            <Box
                                                className="bookmark-bg-image"
                                                sx={{
                                                    position: 'absolute',
                                                    top: -20,
                                                    right: -20,
                                                    width: '180px',
                                                    height: '180px',
                                                    opacity: 0.15,
                                                    transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                    pointerEvents: 'none',
                                                    zIndex: 0,
                                                }}
                                            >
                                                <img
                                                    src={getTopicImage(bookmark.topicSlug)}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        filter: isDark ? 'brightness(0.7)' : 'brightness(1.2)',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </Box>

                                            {/* Gradient Accent */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '150px',
                                                    background: `linear-gradient(135deg, ${topicColor}15 0%, transparent 100%)`,
                                                    opacity: 0.6,
                                                    pointerEvents: 'none',
                                                    zIndex: 0,
                                                }}
                                            />

                                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1, flexGrow: 1 }}>
                                                {/* Type Chip */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Chip
                                                        label={bookmark.type}
                                                        size="small"
                                                        sx={{
                                                            borderRadius: '9999px',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'capitalize',
                                                            bgcolor: `${topicColor}20`,
                                                            color: topicColor,
                                                            border: `2px solid ${topicColor}40`,
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveBookmark(bookmark.id);
                                                        }}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                bgcolor: 'error.main',
                                                                color: 'white',
                                                            },
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                {/* Title */}
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: topicColor,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        minHeight: '3.6em',
                                                    }}
                                                >
                                                    {bookmark.title}
                                                </Typography>

                                                {/* Topic Info */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '8px',
                                                            background: `linear-gradient(135deg, ${topicColor}20 0%, ${topicColor}10 100%)`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '2px solid',
                                                            borderColor: `${topicColor}40`,
                                                        }}
                                                    >
                                                        <img
                                                            src={getTopicImage(bookmark.topicSlug)}
                                                            alt={bookmark.topicSlug}
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
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.secondary',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {bookmark.topicSlug}
                                                    </Typography>
                                                </Box>

                                                {/* Arrow */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mt: 'auto',
                                                        color: topicColor,
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    <span>View</span>
                                                    <ArrowForward
                                                        className="bookmark-arrow"
                                                        sx={{
                                                            fontSize: 20,
                                                            transition: 'transform 0.3s ease',
                                                        }}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 12,
                                px: 3,
                            }}
                        >
                            <BookmarkIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                {filter === 'all' ? 'No bookmarks yet' : `No ${filter}s bookmarked`}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                {filter === 'all'
                                    ? 'Start bookmarking topics, categories, and sections to access them quickly!'
                                    : `You haven't bookmarked any ${filter}s yet.`}
                            </Typography>
                            {filter !== 'all' && (
                                <Button
                                    variant="outlined"
                                    onClick={() => setFilter('all')}
                                    sx={{
                                        borderRadius: '9999px',
                                        px: 3,
                                        borderWidth: '2px',
                                        borderColor: '#5e5ce6',
                                        color: '#5e5ce6',
                                        '&:hover': {
                                            borderWidth: '2px',
                                            borderColor: '#5e5ce6',
                                            background: 'rgba(94, 92, 230, 0.1)',
                                        },
                                    }}
                                >
                                    View All Bookmarks
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                )}
            </Container>

            {/* Clear All Dialog */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => setClearDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Clear All Bookmarks?</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will permanently remove all {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setClearDialogOpen(false)}
                        sx={{
                            borderRadius: '9999px',
                            px: 3,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClearAll}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: '9999px',
                            px: 3,
                        }}
                    >
                        Clear All
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookmarksPage;
