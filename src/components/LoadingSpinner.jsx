import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 3,
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(10, 132, 255, 0.1)'
                                : 'rgba(10, 132, 255, 0.05)',
                    }}
                >
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: 'primary.main',
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            },
                        }}
                    />
                </Box>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    delay: 0.2,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {message}
                </Typography>
            </motion.div>
        </Box>
    );
};

export default LoadingSpinner;
