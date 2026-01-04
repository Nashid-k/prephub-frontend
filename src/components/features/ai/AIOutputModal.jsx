import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Close,
    Lightbulb,
    BugReport,
    AutoFixHigh,
    ContentCopy
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

const AIOutputModal = ({ open, onClose, type, response, loading }) => {
    const getConfig = () => {
        switch (type) {
            case 'explain':
                return {
                    icon: <Lightbulb />,
                    title: 'Code Explanation',
                    loadingText: 'Generating clear explanation...',
                    color: '#0a84ff',
                    bgcolor: 'rgba(10, 132, 255, 0.1)'
                };
            case 'debug':
                return {
                    icon: <BugReport />,
                    title: 'Debug Analysis',
                    loadingText: 'Hunting for bugs & issues...',
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.1)'
                };
            case 'optimize':
                return {
                    icon: <AutoFixHigh />,
                    title: 'Optimization Suggestions',
                    loadingText: 'Improving time & space complexity...',
                    color: '#8b5cf6',
                    bgcolor: 'rgba(139, 92, 246, 0.1)'
                };
            default:
                return {
                    icon: <Lightbulb />,
                    title: 'AI Assistant',
                    loadingText: 'AI is thinking...',
                    color: '#0a84ff',
                    bgcolor: 'rgba(10, 132, 255, 0.1)'
                };
        }
    };

    const config = getConfig();

    const handleCopy = () => {
        navigator.clipboard.writeText(response);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: config.bgcolor,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {config.icon}
                </Box>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                    {config.title}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                        gap: 2
                    }}>
                        <CircularProgress size={40} sx={{ color: config.color }} />
                        <Typography variant="body2" color="text.secondary">
                            {config.loadingText}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        '& code': {
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: 1,
                            fontSize: '0.9em',
                            fontFamily: 'monospace'
                        },
                        '& pre': {
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            padding: 2,
                            borderRadius: 2,
                            overflow: 'auto',
                            fontSize: '0.9em'
                        },
                        '& pre code': {
                            backgroundColor: 'transparent',
                            padding: 0
                        },
                        '& ul, & ol': {
                            paddingLeft: 3
                        },
                        '& li': {
                            marginBottom: 1
                        },
                        '& h1, & h2, & h3': {
                            marginTop: 2,
                            marginBottom: 1
                        }
                    }}>
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </Box>
                )}
            </DialogContent>

            {!loading && (
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        startIcon={<ContentCopy />}
                        onClick={handleCopy}
                        sx={{ borderRadius: '9999px' }}
                    >
                        Copy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            borderRadius: '9999px',
                            bgcolor: config.color,
                            '&:hover': { bgcolor: config.color, opacity: 0.9 }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default AIOutputModal;
