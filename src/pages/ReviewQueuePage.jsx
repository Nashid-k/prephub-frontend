import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Paper,
    LinearProgress,
    Grid,
} from '@mui/material';
import {
    School,
    CalendarToday,
    Psychology,
    TrendingUp,
} from '@mui/icons-material';
import { progressAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDueReviews, getDifficultyLabel, getDifficultyColor } from '../utils/spacedRepetition';

const ReviewQueuePage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, overdue: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await progressAPI.getDueReviews();
            const dueReviews = response.data.reviews || [];

            setReviews(dueReviews);

            // Calculate stats
            const today = new Date().toDateString();
            const todayReviews = dueReviews.filter(r =>
                new Date(r.reviewData?.nextReview).toDateString() === today
            );
            const overdueReviews = dueReviews.filter(r =>
                new Date(r.reviewData?.nextReview) < new Date()
            );

            setStats({
                total: dueReviews.length,
                today: todayReviews.length,
                overdue: overdueReviews.length
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl">
                    <LoadingSpinner message="Loading review queue..." />
                </Container>
            </Box>
        );
    }

    if (reviews.length === 0) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', py: 6 }}>
                <Container maxWidth="md">
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <School sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            All Caught Up! 🎉
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            No sections are due for review right now. Keep studying to add more to your review queue!
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/dashboard"
                            size="large"
                            sx={{ borderRadius: '20px' }}
                        >
                            Back to Dashboard
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', py: 6 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(94, 92, 230, 0.3)',
                            }}
                        >
                            <Psychology sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: 'linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Review Queue
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400 }}>
                            Spaced repetition for better retention
                        </Typography>
                    </Box>
                </motion.div>

                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Reviews
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {stats.today}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Due Today
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                {stats.overdue}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Overdue
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Review List */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Sections to Review
                </Typography>

                <Grid container spacing={3}>
                    {reviews.map((review, index) => {
                        const isOverdue = new Date(review.reviewData?.nextReview) < new Date();
                        const daysOverdue = Math.floor(
                            (new Date() - new Date(review.reviewData?.nextReview)) / (1000 * 60 * 60 * 24)
                        );

                        return (
                            <Grid item xs={12} md={6} key={review._id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            transition: 'all 0.3s',
                                            border: isOverdue ? '2px solid' : '1px solid',
                                            borderColor: isOverdue ? 'error.main' : 'divider',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4,
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {review.sectionName}
                                                </Typography>
                                                {isOverdue && (
                                                    <Chip
                                                        label={`${daysOverdue}d overdue`}
                                                        color="error"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {review.topicName} → {review.categoryName}
                                            </Typography>

                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarToday sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">
                                                        {new Date(review.reviewData?.nextReview).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <TrendingUp sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">
                                                        {review.reviewData?.reviewCount || 0} reviews
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                component={Link}
                                                to={`/topic/${review.topicSlug}/category/${review.categorySlug}/section/${review.sectionSlug}`}
                                                sx={{ borderRadius: '20px' }}
                                            >
                                                Review Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
};

export default ReviewQueuePage;
