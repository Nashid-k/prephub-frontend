import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { ContentCopy, ArrowBack } from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';
import LZString from 'lz-string';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const ShareCodePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    useEffect(() => {
        try {
            const compressed = searchParams.get('code');
            const lang = searchParams.get('lang') || 'javascript';

            if (compressed) {
                const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
                setCode(decompressed || '// No code found');
                setLanguage(lang);
            } else {
                setCode('// No code provided in URL');
            }
        } catch (error) {
            console.error('Error decoding code:', error);
            setCode('// Error: Unable to decode code from URL');
            toast.error('Failed to load shared code');
        }
    }, [searchParams]);

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Share link copied!');
    };

    return (
        <Container maxWidth="xl" sx={{
            py: 12, // Increased top padding to clear navbar
            minHeight: '100vh',
            background: (theme) =>
                theme.palette.mode === 'dark'
                    ? 'radial-gradient(circle at top center, rgba(10, 132, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)'
                    : 'radial-gradient(circle at top center, rgba(10, 132, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Shared Code Snippet
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopy />}
                            onClick={copyLink}
                        >
                            Copy Link
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ContentCopy />}
                            onClick={copyCode}
                        >
                            Copy Code
                        </Button>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    Language: {language}
                </Typography>
            </Box>

            <Paper elevation={0} sx={{
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(0,0,0,0.05)',
            }}>
                <Editor
                    height="70vh"
                    language={language}
                    value={code}
                    theme={theme === 'dark' ? 'vsc-dark-plus' : 'light'} // Match global editor theme if possible, or just vs-dark
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 20, bottom: 20 }
                    }}
                />
            </Paper>
        </Container>
    );
};

export default ShareCodePage;
