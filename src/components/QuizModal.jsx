import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, AppBar, Toolbar, IconButton,
    Typography, Button, Box, CircularProgress, Slide, Fade, Grid, styled
} from '@mui/material';
import {
    Close, CheckCircle, Cancel, EmojiEvents, Psychology,
    Lightbulb, Refresh
} from '@mui/icons-material';
import { aiAPI } from '../services/api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Styled Option Button with better visual feedback
const OptionButton = styled(Box)(({ theme, state }) => ({ // state: 'default' | 'correct' | 'wrong' | 'disabled'
    padding: '16px 20px',
    borderRadius: '16px',
    border: '2px solid',
    marginBottom: '12px',
    cursor: state === 'disabled' ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: state === 'correct' ? 'rgba(46, 125, 50, 0.1)'
        : state === 'wrong' ? 'rgba(211, 47, 47, 0.1)'
            : 'transparent',
    borderColor: state === 'correct' ? '#2e7d32'
        : state === 'wrong' ? '#d32f2f'
            : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
    color: state === 'correct' ? '#2e7d32'
        : state === 'wrong' ? '#d32f2f'
            : 'inherit',

    '&:hover': {
        background: state === 'default'
            ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
            : undefined,
        borderColor: state === 'default'
            ? theme.palette.primary.main
            : undefined,
        transform: state === 'default' ? 'translateY(-2px)' : 'none'
    }
}));

const QuizModal = ({ open, onClose, topic, section, isDark, language = 'javascript', content = '' }) => {
    // ... (rest of component logic) ...

    return (
        <Dialog
            // ... (props) ...
            PaperProps={{
                sx: {
                    m: 2,
                    bgcolor: isDark ? 'rgba(30, 30, 32, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }
            }}
        >
            {/* ... */}
            {/* Explanation / Next Button */}
            {showExplanation && (
                <Fade in={true}>
                    <Box sx={{ mt: 3, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '16px', borderLeft: `4px solid ${primaryColor}` }}>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                            <Lightbulb sx={{ color: 'warning.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Explanation</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
                            {currentQuestion.explanation}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleNextQuestion}
                                sx={{ bgcolor: primaryColor, color: 'white', borderRadius: '12px', px: 3, '&:hover': { bgcolor: '#4b4acb' } }}
                            >
                                {currentIndex === quiz.length - 1 ? 'See Results' : 'Next Question'}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            )}
        </Box>
                        </Fade >
                    )}
                </Box >
            </DialogContent >
        </Dialog >
    );
};

export default QuizModal;
