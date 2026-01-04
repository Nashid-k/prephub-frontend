import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { getCategoryFromPath, processMessage } from '../../utils/loadingMessages';
// Assuming messageCategories is exported as default or we can access it via getCategoryFromPath logic
import messageCategories from '../../utils/loadingMessages';

const GlobalLoader = ({ isDark: propsIsDark, fullScreen = false }) => {
    const theme = useTheme();
    const isDark = propsIsDark !== undefined ? propsIsDark : theme.palette.mode === 'dark';
    const location = useLocation();

    // Determine category based on current path
    const category = getCategoryFromPath(location.pathname);
    const texts = messageCategories[category] || messageCategories.default;

    // Initialize with a random index so it doesn't always start with the first message
    const [textIndex, setTextIndex] = useState(() => Math.floor(Math.random() * texts.length));

    // Extract dynamic data (e.g., topic name)
    const topicMatch = location.pathname.match(/\/topic\/([^\/]+)/);
    const topicSlug = topicMatch ? topicMatch[1] : '';
    // Formatter for topic name: "react-js" -> "React Js"
    const topicName = topicSlug
        ? topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : '';

    const dynamicData = { topic: topicName };

    useEffect(() => {
        // Reset/Randomize index when category changes
        setTextIndex(Math.floor(Math.random() * texts.length));
    }, [category, texts.length]);


    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % texts.length);
        }, 2000); // Slowed down slightly for readability of longer tips
        return () => clearInterval(interval);
    }, [texts.length]);

    const content = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: fullScreen ? '100vh' : '400px',
            gap: 4
        }}>
            <Box sx={{ position: 'relative' }}>
                {/* Animated rings using theme colors */}
                <Box sx={{
                    position: 'absolute', inset: -20, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: theme.palette.primary.main,
                    borderRightColor: theme.palette.secondary.main,
                    animation: 'spin 1.6s linear infinite'
                }} />
                <Box sx={{
                    position: 'absolute', inset: -10, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderBottomColor: theme.palette.success.main,
                    borderLeftColor: theme.palette.warning.main,
                    animation: 'spin 2.2s linear infinite reverse'
                }} />

                {/* Central brand blob - matches Aurora background styling */}
                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${theme.palette.primary.main}, ${theme.palette.secondary.main} 60%)`,
                    boxShadow: `0 6px 24px ${theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)'}`,
                    transform: 'translateZ(0)',
                    animation: 'pulse 2s infinite'
                }} />
            </Box>
            <AnimatePresence mode="wait">
                <motion.div
                    key={textIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Typography variant="h5" sx={{
                        fontWeight: 600,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        fontFamily: theme.typography.fontFamily
                    }}>
                        {processMessage(texts[textIndex], dynamicData)}
                    </Typography>
                </motion.div>
            </AnimatePresence>
            <style>
                {`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.9); } }
                `}
            </style>
        </Box>
    );

    if (fullScreen) {
        return (
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1400,
                bgcolor: isDark ? 'rgba(9,10,12,0.85)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
            }}>
                {/* Slight border to match app cards */}
                <Box sx={{ position: 'absolute', inset: 0, border: `1px solid ${theme.palette.divider}`, pointerEvents: 'none' }} />
                {content}
            </Box>
        );
    }

    return content;
};

export default GlobalLoader;
