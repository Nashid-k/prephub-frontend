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
            : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    color: state === 'correct' ? '#2e7d32'
        : state === 'wrong' ? '#d32f2f'
            : 'inherit',

    '&:hover': {
        background: state === 'default'
            ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            : undefined,
        borderColor: state === 'default'
            ? theme.palette.primary.main
            : undefined,
        transform: state === 'default' ? 'translateY(-2px)' : 'none'
    }
}));

const QuizModal = ({ open, onClose, topic, section, isDark }) => {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null); // Index of selected option
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [error, setError] = useState(null);

    // Initial Fetch
    useEffect(() => {
        if (open && topic && section) {
            fetchQuiz();
        }
    }, [open, topic, section]);

    const fetchQuiz = async (regenerate = false) => {
        setLoading(true);
        setError(null);
        setQuiz([]);
        setScore(0);
        setCurrentIndex(0);
        setQuizCompleted(false);
        setSelectedOption(null);
        setShowExplanation(false);

        try {
            const response = await aiAPI.generateQuiz(topic, section, regenerate);
            if (response.data.success && response.data.quiz) {
                setQuiz(response.data.quiz);
            } else {
                setError('Failed to load quiz data.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return; // Prevent changing answer

        setSelectedOption(index);
        setShowExplanation(true);

        if (index === quiz[currentIndex].correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < quiz.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleClose = () => {
        if (quizCompleted) {
            onClose(); // Just close if done
        } else {
            // Confirm closure if mid-quiz? No, simplifies UX just to close.
            onClose();
        }
    };

    const currentQuestion = quiz[currentIndex];

    // Colors
    const primaryColor = '#5e5ce6';
    const bgColor = isDark ? '#1c1c1e' : '#ffffff';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: isDark ? 'rgba(30, 30, 32, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Psychology sx={{ color: primaryColor, fontSize: 32 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        AI Knowledge Check
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
                    <Close />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 4, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    {loading ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress size={60} sx={{ color: primaryColor, mb: 4 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>Generative AI is crafting your quiz...</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Analyzing {section}...</Typography>
                        </Box>
                    ) : error ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Cancel sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                            <Typography variant="h6" color="error">{error}</Typography>
                            <Button variant="outlined" onClick={fetchQuiz} sx={{ mt: 3, borderRadius: '24px' }}>Try Again</Button>
                        </Box>
                    ) : quizCompleted ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <EmojiEvents sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Quiz Complete!</Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                                You scored {score} out of {quiz.length}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => fetchQuiz(true)}
                                    startIcon={<Refresh />}
                                    sx={{ borderRadius: '24px', px: 4, py: 1.5 }}
                                >
                                    New Quiz
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleClose}
                                    sx={{ bgcolor: primaryColor, color: 'white', borderRadius: '24px', px: 4, py: 1.5, '&:hover': { bgcolor: '#4b4acb' } }}
                                >
                                    Finish
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Fade in={true} key={currentIndex}>
                            <Box>
                                {/* Progress Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Question {currentIndex + 1} / {quiz.length}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {quiz.map((_, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    bgcolor: idx === currentIndex ? primaryColor : idx < currentIndex ? 'success.main' : 'action.disabledBackground'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Question */}
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, lineHeight: 1.4 }}>
                                    {currentQuestion.question}
                                </Typography>

                                {/* Options */}
                                <Box>
                                    {currentQuestion.options.map((option, idx) => {
                                        let state = 'default';
                                        if (selectedOption !== null) {
                                            if (idx === currentQuestion.correctIndex) state = 'correct';
                                            else if (idx === selectedOption) state = 'wrong';
                                            else state = 'disabled';
                                        }

                                        return (
                                            <OptionButton
                                                key={idx}
                                                state={state}
                                                onClick={() => handleOptionSelect(idx)}
                                            >
                                                <Box sx={{
                                                    width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                                                    borderColor: 'currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, fontWeight: 700, flexShrink: 0
                                                }}>
                                                    {['A', 'B', 'C', 'D'][idx]}
                                                </Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{option}</Typography>

                                                {state === 'correct' && <CheckCircle sx={{ ml: 'auto' }} />}
                                                {state === 'wrong' && <Cancel sx={{ ml: 'auto' }} />}
                                            </OptionButton>
                                        );
                                    })}
                                </Box>

                                {/* Explanation / Next Button */}
                                {showExplanation && (
                                    <Fade in={true}>
                                        <Box sx={{ mt: 3, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: '16px', borderLeft: `4px solid ${primaryColor}` }}>
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
                        </Fade>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default QuizModal;
