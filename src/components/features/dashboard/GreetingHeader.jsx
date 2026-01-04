import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { LocalFireDepartment, EmojiEvents } from '@mui/icons-material';
import { motion } from 'framer-motion';

const GreetingHeader = ({ user, streak }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Scholar'}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Ready to making some progress today?
                </Typography>
            </Box>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '20px',
                        background: isDark ? 'rgba(255, 107, 53, 0.1)' : '#fff5f0',
                        border: '1px solid',
                        borderColor: 'rgba(255, 107, 53, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Box sx={{
                        width: 40, height: 40,
                        borderRadius: '12px',
                        bgcolor: '#ff6b35',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                        <LocalFireDepartment />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#ff6b35', lineHeight: 1 }}>
                            {streak?.currentStreak || 0} Day Streak
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ff6b35', opacity: 0.8, fontWeight: 600, letterSpacing: 0.5 }}>
                            KEEP IT UP
                        </Typography>
                    </Box>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default GreetingHeader;
