import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * AdaptiveGlass
 * A visionOS-inspired container with advanced glassmorphism.
 * Features:
 * - Double-layer blur (background + saturation boost)
 * - Subtle noise texture (optional)
 * - Specular border highlight
 * - Dynamic shadow based on elevation
 */
const AdaptiveGlass = ({
    children,
    intensity = 'medium', // low, medium, high
    color = 'default', // default, primary, accent
    elevation = 0,
    hoverEffect = false,
    sx = {},
    ...props
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Config based on intensity
    const blurs = {
        low: '10px',
        medium: '20px',
        high: '40px'
    };

    // Base background opacity
    const opacities = {
        low: isDark ? 0.3 : 0.4,
        medium: isDark ? 0.5 : 0.65,
        high: isDark ? 0.7 : 0.8
    };

    // Determine background color
    let bgBase = isDark ? '#121212' : '#ffffff';
    if (color === 'primary') bgBase = theme.palette.primary.main;

    const backgroundColor = alpha(bgBase, opacities[intensity]);
    const borderColor = isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.4)';
    const highlightColor = isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.6)';

    return (
        <Box
            component={motion.div}
            whileHover={hoverEffect ? { y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            sx={{
                position: 'relative',
                backdropFilter: `blur(${blurs[intensity]}) saturate(180%)`,
                WebkitBackdropFilter: `blur(${blurs[intensity]}) saturate(180%)`, // Safari
                backgroundColor,
                borderRadius: '24px',
                border: '1px solid',
                borderColor,
                boxShadow: isDark
                    ? `0 ${elevation * 4}px ${elevation * 10}px rgba(0,0,0,0.3)`
                    : `0 ${elevation * 4}px ${elevation * 10}px rgba(0,0,0,0.05)`,
                overflow: 'hidden',
                ...sx
            }}
            {...props}
        >
            {/* Specular Highlight (Top Border) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent 0%, ${highlightColor} 50%, transparent 100%)`,
                    opacity: 0.8,
                    pointerEvents: 'none'
                }}
            />

            {/* Noise Texture (Optional - keeping subtle) */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isDark ? 0.03 : 0.02,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {children}
            </Box>
        </Box>
    );
};

export default AdaptiveGlass;
