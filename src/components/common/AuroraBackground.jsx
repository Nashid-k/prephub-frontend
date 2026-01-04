import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * AuroraBackground - Premium animated mesh gradient background
 * 
 * Features:
 * - Dynamic color shifting based on topic/theme
 * - Mouse-interactive subtle parallax
 * - "Organic" breathing animation using canvas/blur
 * - Performance optimized (will-change: transform)
 */
const AuroraBackground = ({
    children,
    color = '#6366f1', // Default Indigo
    intensity = 'medium'
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const deviceMemory = navigator.deviceMemory || 8; // use to tune visuals on low-end devices

    // Mouse tracking for subtle parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out mouse movements
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Throttle mouse move with requestAnimationFrame to avoid main-thread spikes
    let raf = null;
    const handleMouseMove = ({ clientX, clientY }) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // avoid if user prefers reduced motion
        if (raf) return;
        raf = requestAnimationFrame(() => {
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth) - 0.5;
            const y = (clientY / innerHeight) - 0.5;
            // reduce intensity on low-memory devices
            const deviceMemory = navigator.deviceMemory || 8;
            const intensityFactor = deviceMemory < 4 ? 0.4 : 1;
            mouseX.set(x * 20 * intensityFactor);
            mouseY.set(y * 20 * intensityFactor);
            raf = null;
        });
    };

    // Dynamic gradient colors based on prop and theme
    const bgBase = isDark ? '#000000' : '#ffffff';
    const blobOpacity = isDark ? 0.4 : 0.6;

    return (
        <Box
            onMouseMove={handleMouseMove}
            sx={{
                position: 'relative',
                minHeight: '100vh',
                width: '100%',
                overflow: 'hidden',
                bgcolor: bgBase,
                transition: 'background-color 0.5s ease'
            }}
        >
            {/* Ambient Blobs Layer */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                overflow: 'hidden',
            }}>
                {/* Main Topic Color Blob */}
                <motion.div
                    style={{
                        x: springX,
                        y: springY,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                        opacity: [blobOpacity, blobOpacity * 0.8, blobOpacity]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '60vw',
                        height: '60vw',
                        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                        background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
                        filter: deviceMemory < 4 ? 'blur(36px)' : 'blur(80px)',
                        opacity: deviceMemory < 4 ? 0.45 : 0.6,
                        mixBlendMode: isDark ? 'screen' : 'multiply',
                        willChange: 'transform, opacity'
                    }} />
                </motion.div>

                {/* Secondary Accent Blob (Cyan/Blue) */}
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '20%',
                        right: '-10%',
                        width: '50vw',
                        height: '50vw',
                        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                        background: `radial-gradient(circle at center, ${isDark ? '#4ade80' : '#818cf8'}, transparent 70%)`, // Green/Indigo ACCENT
                        filter: 'blur(90px)',
                        opacity: 0.4,
                        mixBlendMode: isDark ? 'screen' : 'multiply'
                    }} />
                </motion.div>

                {/* Third "Depth" Blob (Purple/Rose) */}
                <motion.div
                    animate={{
                        scale: [0.9, 1.1, 0.9],
                        x: [0, -40, 0],
                        rotate: [0, 15, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '20%',
                        width: '50vw',
                        height: '50vw',
                        borderRadius: '50% 50% 30% 70% / 50% 50% 70% 60%',
                        background: `radial-gradient(circle at center, ${isDark ? '#a78bfa' : '#fb7185'}, transparent 70%)`, // Purple/Rose ACCENT
                        filter: 'blur(100px)',
                        opacity: 0.3,
                        mixBlendMode: isDark ? 'screen' : 'multiply'
                    }} />
                </motion.div>

                {/* Noise Texture Overlay for "Film Grain" Feel */}
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    opacity: isDark ? 0.03 : 0.05,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                    zIndex: 1
                }} />
            </Box>

            {/* Content Container */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AuroraBackground;
