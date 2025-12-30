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
        <Container maxWidth="xl" sx={{ py: 4 }}>
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

            <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Editor
                    height="70vh"
                    language={language}
                    value={code}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }}
                />
            </Paper>
        </Container>
    );
};

export default ShareCodePage;
