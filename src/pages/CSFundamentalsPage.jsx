import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Grid, Typography, Box, Button, Alert, useTheme as useMuiTheme } from '@mui/material';
import { Refresh, Computer } from '@mui/icons-material';
import { curriculumAPI } from '../services/api';
import TopicCard from '../components/features/dashboard/TopicCard';
import GlobalLoader from '../components/common/GlobalLoader';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const CSFundamentalsPage = () => {
    const navigate = useNavigate();
    const theme = useMuiTheme();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // CS Fundamentals slugs to include
    const targetSlugs = ['operating-systems', 'networking'];

    useEffect(() => {
        // Load from cache or fetch
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await curriculumAPI.getAllTopics();
            const allTopics = response.data.topics;

            // Filter only target topics
            const filteredTopics = allTopics.filter(t => targetSlugs.includes(t.slug));
            setTopics(filteredTopics);
            setError(null);
        } catch (err) {
            console.error('Error fetching topics:', err);
            setError('Failed to load CS Fundamentals topics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <GlobalLoader fullScreen />
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: 'calc(100vh - 100px)', py: 6 }}>
            <Container maxWidth="xl">
                <Button
                    onClick={() => navigate('/dashboard')}
                    startIcon={<ArrowBack />}
                    sx={{
                        mb: 4,
                        borderRadius: '9999px',
                        textTransform: 'none',
                        color: 'text.secondary'
                    }}
                >
                    Back to Dashboard
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)',
                                mb: 3,
                                boxShadow: '0 8px 24px rgba(48, 209, 88, 0.3)',
                            }}
                        >
                            <Computer sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                background: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            CS Fundamentals
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 400, mb: 3 }}>
                            Master the core concepts of Computer Science
                        </Typography>
                    </Box>
                </motion.div>

                <Grid container spacing={3}>
                    {topics.map((topic, index) => (
                        <Grid item xs={12} sm={6} md={4} key={topic._id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.05,
                                }}
                            >
                                <TopicCard topic={topic} />
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default CSFundamentalsPage;
