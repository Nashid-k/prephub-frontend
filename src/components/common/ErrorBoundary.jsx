import React, { Component } from 'react';
import { Box, Container, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.state = {
            hasError: true,
            error,
            errorInfo
        };
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        py: 6,
                    }}
                >
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 3,
                                    borderRadius: '50%',
                                    bgcolor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 69, 58, 0.1)'
                                            : 'rgba(255, 69, 58, 0.05)',
                                    mb: 4,
                                }}
                            >
                                <BugReport sx={{ fontSize: 64, color: 'error.main' }} />
                            </Box>

                            <Typography
                                variant="h2"
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                }}
                            >
                                Oops! Something went wrong
                            </Typography>

                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
                            >
                                We encountered an unexpected error. Don't worry, we've logged it and will look into it.
                            </Typography>

                            {this.state.error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 4,
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <AlertTitle sx={{ fontWeight: 700 }}>Error Details</AlertTitle>
                                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {this.state.error.toString()}
                                    </Typography>
                                </Alert>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Refresh />}
                                    onClick={this.handleReset}
                                    sx={{
                                        borderRadius: '9999px',
                                        px: 4,
                                        py: 1.5,
                                        background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #409cff 0%, #7d7bf0 100%)',
                                        },
                                    }}
                                >
                                    Go to Home
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => window.location.reload()}
                                    sx={{
                                        borderRadius: '9999px',
                                        px: 4,
                                        py: 1.5,
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderWidth: '2px',
                                        },
                                    }}
                                >
                                    Reload Page
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
