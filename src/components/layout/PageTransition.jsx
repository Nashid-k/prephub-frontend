import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition - Wrapper for route components to handle enter/exit animations
 * 
 * Features:
 * - Slide up and fade in effect
 * - Staggered children animation support
 * - Clean exit animation
 */
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
            }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
