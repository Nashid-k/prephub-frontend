import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
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
                <Box sx={{
                    position: 'absolute', inset: -20, borderRadius: '50%',
                    border: '2px solid transparent', borderTopColor: '#0a84ff', borderRightColor: '#bf5af2',
                    animation: 'spin 1.5s linear infinite'
                }} />
                <Box sx={{
                    position: 'absolute', inset: -10, borderRadius: '50%',
                    border: '2px solid transparent', borderBottomColor: '#34c759', borderLeftColor: '#ff9f0a',
                    animation: 'spin 2s linear infinite reverse'
                }} />
                <AutoAwesome sx={{
                    fontSize: 48,
                    color: isDark ? 'white' : '#1a1a1a',
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
                        background: isDark
                            ? 'linear-gradient(45deg, #fff, #aaa)'
                            : 'linear-gradient(45deg, #000, #555)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center'
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
                zIndex: 9999,
                bgcolor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {content}
            </Box>
        );
    }

    return content;
};

export default GlobalLoader;
