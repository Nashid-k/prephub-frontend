import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Grid, Typography, Box, Button, Alert } from '@mui/material';
import { Refresh, School } from '@mui/icons-material';
import { curriculumAPI } from '../services/api';
import TopicCard from '../components/TopicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StreakBadge from '../components/StreakBadge';
import './Dashboard.css';

const Dashboard = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Load from cache first for instant UI
        const cachedTopics = localStorage.getItem('prephub_topics');
        if (cachedTopics) {
            try {
                setTopics(JSON.parse(cachedTopics));
                setLoading(false); // Stop loading if we have cached data
            } catch (e) {
                console.error('Failed to parse cached topics');
            }
        }

        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            // Only show loader if we don't have cached data
            if (!localStorage.getItem('prephub_topics')) {
                setLoading(true);
            }

            const response = await curriculumAPI.getAllTopics();
            const newTopics = response.data.topics;

            setTopics(newTopics);
            // 2. Save to cache for next visit
            localStorage.setItem('prephub_topics', JSON.stringify(newTopics));
            setError(null);
        } catch (err) {
            console.error('Error fetching topics:', err);
            // If we have cached data, don't show error (just use stale data)
            if (!localStorage.getItem('prephub_topics')) {
                setError('Failed to load topics. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl">
                    <LoadingSpinner message="Loading curriculum..." />
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="md">
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: '24px',
                            p: 3,
                        }}
                        action={
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={fetchTopics}
                                sx={{
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                }}
                            >
                                Retry
                            </Button>
                        }
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {error}
                        </Typography>
                    </Alert>
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
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(10, 132, 255, 0.3)',
                            }}
                        >
                            <School sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Your Learning Journey
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400, mb: 3 }}>
                            Choose a topic to begin mastering
                        </Typography>

                        {/* Streak Badge */}
                        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                            <StreakBadge variant="full" />
                        </Box>
                    </Box>
                </motion.div>

                {/* Topics Grid */}
                <Grid container spacing={3}>
                    {topics.map((topic, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={topic._id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: [0.25, 0.1, 0.25, 1],
                                }}
                                style={{ height: '100%' }}
                            >
                                <TopicCard topic={topic} />
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Empty State */}
                {topics.length === 0 && !loading && !error && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" color="text.secondary">
                            No topics available yet
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Dashboard;
