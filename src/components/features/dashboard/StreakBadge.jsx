import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { LocalFireDepartment, EmojiEvents } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getStreakData, updateStreak, getStreakEmoji, getStreakMessage } from '../utils/streakTracker';

const StreakBadge = ({ variant = 'full' }) => {
    const [streakData, setStreakData] = useState(null);

    useEffect(() => {
        const updated = updateStreak();
        setStreakData(updated);
    }, []);

    if (!streakData) return null;

    const { currentStreak, longestStreak } = streakData;

    if (variant === 'compact') {
        return (
            <Tooltip
                title={`${currentStreak} day streak! ${getStreakMessage(currentStreak)}`}
                arrow
            >
                <Chip
                    icon={<LocalFireDepartment sx={{ color: '#ff6b35 !important' }} />}
                    label={currentStreak}
                    size="small"
                    sx={{
                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                        transition: 'transform 0.2s'
                    }}
                />
            </Tooltip>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        fontSize: '32px',
                    }}
                >
                    {getStreakEmoji(currentStreak)}
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {currentStreak} Day Streak!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {getStreakMessage(currentStreak)}
                    </Typography>
                </Box>

                {longestStreak > currentStreak && (
                    <Tooltip title="Your longest streak" arrow>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            <EmojiEvents sx={{ fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {longestStreak}
                            </Typography>
                        </Box>
                    </Tooltip>
                )}
            </Box>
        </motion.div>
    );
};

export default React.memo(StreakBadge);
