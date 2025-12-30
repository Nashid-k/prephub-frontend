import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Card, CardContent, Typography, Divider } from '@mui/material';
import { School, Security } from '@mui/icons-material';
import './LoginPage.css';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    const handleSuccess = (credentialResponse) => {
        login(credentialResponse);
    };

    const handleError = () => {
        console.error('Google Login Failed');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'radial-gradient(ellipse at center, rgba(10, 132, 255, 0.15) 0%, transparent 50%)'
                        : 'radial-gradient(ellipse at center, rgba(10, 132, 255, 0.08) 0%, transparent 50%)',
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: '32px',
                        overflow: 'hidden',
                    }}
                >
                    <CardContent sx={{ p: 6, textAlign: 'center' }}>
                        {/* Logo */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 3,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                mb: 3,
                            }}
                        >
                            <School sx={{ fontSize: 48, color: 'white' }} />
                        </Box>

                        {/* Header */}
                        <Typography
                            variant="h3"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Welcome to PrepHub
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                            Your ultimate MERN Stack preparation companion
                        </Typography>

                        <Divider sx={{ my: 4 }} />

                        {/* Google Login */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                theme="filled_black"
                                size="large"
                                shape="pill"
                                text="continue_with"
                            />
                        </Box>

                        {/* Footer */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                mt: 4,
                                p: 2,
                                borderRadius: '16px',
                                bgcolor: 'action.hover',
                            }}
                        >
                            <Security sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                By continuing, you verify that you are not a robot but a developer 🤖
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default LoginPage;
