import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? '#0a84ff' : '#007aff',
            light: '#409cff',
            dark: '#0066cc',
        },
        secondary: {
            main: mode === 'dark' ? '#5e5ce6' : '#5856d6',
            light: '#7d7bf0',
            dark: '#4240b8',
        },
        success: {
            main: '#30d158',
            light: '#5de67c',
            dark: '#26a644',
        },
        warning: {
            main: '#ff9f0a',
            light: '#ffb340',
            dark: '#cc7f08',
        },
        error: {
            main: '#ff453a',
            light: '#ff6961',
            dark: '#cc372e',
        },
        info: {
            main: '#64d2ff',
            light: '#8addff',
            dark: '#50a8cc',
        },
        // Custom accent colors
        accent: {
            purple: '#bf5af2',
            pink: '#ff375f',
            orange: '#ff9f0a',
            yellow: '#ffd60a',
            green: '#30d158',
            teal: '#5ac8fa',
            cyan: '#64d2ff',
            indigo: '#5e5ce6',
        },
        background: {
            default: mode === 'dark' ? '#000000' : '#ffffff',
            paper: mode === 'dark' ? '#1c1c1e' : '#f2f2f7',
        },
        text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#98989d' : '#6e6e73',
        },
        divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '9999px',
                    padding: '10px 24px',
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '24px',
                    boxShadow: mode === 'dark'
                        ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                        : '0 4px 20px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '9999px',
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                    },
                },
            },
        },
    },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));

export default createAppTheme;
