import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Breadcrumbs, Link as MuiLink, Button, Tooltip, Zoom, Fade, CircularProgress, Collapse } from '@mui/material';
import { SmartToy, AutoFixHigh, QuestionMark, BugReport, Close, Send, Lightbulb } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CopilotWidget = ({ onAiAction, isDark, topicName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('menu'); // 'menu' | 'chat' | 'thinking'
    const [thinkingText, setThinkingText] = useState('');

    const glassSx = {
        background: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.1)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.15)',
    };

    const handleAction = (action, text) => {
        setMode('thinking');
        setThinkingText(text);
        if (onAiAction) {
            onAiAction(action);
            // Parent is responsible for resetting mode or showing result
            // For now we just simulate a reset after action is dispatched
            setTimeout(() => {
                setMode('menu');
                setIsOpen(false);
            }, 1000); // Visual feedback only, real app would wait for promise
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ originX: 1, originY: 1 }}
                    >
                        <Paper sx={{ ...glassSx, width: 320, borderRadius: '24px', overflow: 'hidden' }}>
                            {/* Header */}
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SmartToy sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>PrepHub Copilot</Typography>
                                </Box>
                                <IconButton size="small" onClick={() => setIsOpen(false)}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* Content */}
                            <Box sx={{ p: 2 }}>
                                {mode === 'thinking' ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" color="text.secondary">{thinkingText}</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                            I can help you with {topicName || 'this topic'}.
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            startIcon={<Lightbulb sx={{ color: '#f59e0b' }} />}
                                            onClick={() => handleAction('explain', 'Explaining concept...')}
                                            sx={{ justifyContent: 'flex-start', borderRadius: '12px', borderColor: 'divider', textTransform: 'none', color: 'text.primary' }}
                                        >
                                            Explain this section
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<QuestionMark sx={{ color: '#3b82f6' }} />}
                                            onClick={() => handleAction('hint', 'Generating hint...')}
                                            sx={{ justifyContent: 'flex-start', borderRadius: '12px', borderColor: 'divider', textTransform: 'none', color: 'text.primary' }}
                                        >
                                            Give me a hint
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<BugReport sx={{ color: '#ef4444' }} />}
                                            onClick={() => handleAction('debug', 'Analyzing code...')}
                                            sx={{ justifyContent: 'flex-start', borderRadius: '12px', borderColor: 'divider', textTransform: 'none', color: 'text.primary' }}
                                        >
                                            Debug my code
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <Tooltip title="Ask AI Copilot" placement="left">
                <Box
                    component={motion.div}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        width: 56, height: 56,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                        boxShadow: '0 8px 20px rgba(94, 92, 230, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    {isOpen ? <Close /> : <SmartToy />}
                </Box>
            </Tooltip>
        </Box>
    );
};

export default CopilotWidget;
