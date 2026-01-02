import { createTheme, alpha } from '@mui/material/styles';

/**
 * Elite Theme System - PrepHub
 * Designed for premium UX with accessibility compliance (WCAG AA)
 * 
 * Dark Mode: Rich charcoal backgrounds with vibrant accents
 * Light Mode: Clean whites with visible borders and proper contrast
 */

const getDesignTokens = (mode) => {
    const isDark = mode === 'dark';

    // Base colors that shift based on mode
    const colors = {
        // Backgrounds - Dark uses rich charcoal, not pure black
        background: {
            default: isDark ? '#0d0d0f' : '#fafbfc',
            paper: isDark ? '#1a1a1f' : '#ffffff',
            elevated: isDark ? '#252529' : '#f8f9fa',
            subtle: isDark ? '#141416' : '#f4f5f7',
        },
        // Borders - Visible in both modes
        border: {
            default: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
            strong: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.2)',
            subtle: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        },
        // Glass effect for cards and overlays
        glass: isDark
            ? 'rgba(26, 26, 31, 0.8)'
            : 'rgba(255, 255, 255, 0.85)',
    };

    return {
        palette: {
            mode,
            primary: {
                main: isDark ? '#3b82f6' : '#2563eb', // Modern blue, accessible
                light: '#60a5fa',
                dark: '#1d4ed8',
                contrastText: '#ffffff',
            },
            secondary: {
                main: isDark ? '#8b5cf6' : '#7c3aed', // Vibrant purple
                light: '#a78bfa',
                dark: '#6d28d9',
                contrastText: '#ffffff',
            },
            success: {
                main: isDark ? '#22c55e' : '#16a34a', // Accessible green
                light: '#4ade80',
                dark: '#15803d',
                contrastText: '#ffffff',
            },
            warning: {
                main: isDark ? '#f59e0b' : '#d97706', // Amber/Orange
                light: '#fbbf24',
                dark: '#b45309',
                contrastText: isDark ? '#000000' : '#ffffff',
            },
            error: {
                main: isDark ? '#ef4444' : '#dc2626', // Red
                light: '#f87171',
                dark: '#b91c1c',
                contrastText: '#ffffff',
            },
            info: {
                main: isDark ? '#06b6d4' : '#0891b2', // Cyan
                light: '#22d3ee',
                dark: '#0e7490',
                contrastText: '#ffffff',
            },
            background: {
                default: colors.background.default,
                paper: colors.background.paper,
            },
            text: {
                primary: isDark ? '#f8fafc' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#64748b',
                disabled: isDark ? '#475569' : '#cbd5e1',
            },
            divider: colors.border.default,
            // Custom tokens for advanced styling
            action: {
                active: isDark ? '#f8fafc' : '#0f172a',
                hover: isDark ? 'rgba(248, 250, 252, 0.08)' : 'rgba(15, 23, 42, 0.04)',
                selected: isDark ? 'rgba(248, 250, 252, 0.12)' : 'rgba(15, 23, 42, 0.08)',
                disabled: isDark ? 'rgba(248, 250, 252, 0.3)' : 'rgba(15, 23, 42, 0.26)',
                disabledBackground: isDark ? 'rgba(248, 250, 252, 0.12)' : 'rgba(15, 23, 42, 0.12)',
            },
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
            h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 },
            h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
            h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
            h4: { fontWeight: 600, letterSpacing: '-0.01em' },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' },
            subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
            body1: { lineHeight: 1.6 },
            body2: { lineHeight: 1.5, color: isDark ? '#cbd5e1' : '#475569' },
            button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
            caption: { color: isDark ? '#64748b' : '#94a3b8' },
        },
        shape: {
            borderRadius: 12,
        },
        shadows: [
            'none',
            isDark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.05)',
            isDark ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.06)',
            isDark ? '0 4px 8px rgba(0,0,0,0.35)' : '0 4px 8px rgba(0,0,0,0.07)',
            isDark ? '0 6px 12px rgba(0,0,0,0.3)' : '0 6px 12px rgba(0,0,0,0.08)',
            isDark ? '0 8px 16px rgba(0,0,0,0.28)' : '0 8px 16px rgba(0,0,0,0.09)',
            isDark ? '0 12px 24px rgba(0,0,0,0.25)' : '0 12px 24px rgba(0,0,0,0.1)',
            isDark ? '0 16px 32px rgba(0,0,0,0.22)' : '0 16px 32px rgba(0,0,0,0.11)',
            isDark ? '0 20px 40px rgba(0,0,0,0.2)' : '0 20px 40px rgba(0,0,0,0.12)',
            ...Array(16).fill(isDark ? '0 24px 48px rgba(0,0,0,0.18)' : '0 24px 48px rgba(0,0,0,0.13)'),
        ],
        components: {
            // === BUTTONS ===
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease-in-out',
                    },
                    contained: {
                        boxShadow: isDark
                            ? '0 2px 8px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                            boxShadow: isDark
                                ? '0 4px 16px rgba(0,0,0,0.5)'
                                : '0 4px 16px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)',
                        },
                    },
                    outlined: {
                        borderWidth: '1.5px',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        '&:hover': {
                            borderWidth: '1.5px',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        },
                    },
                    text: {
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                    },
                    sizeSmall: {
                        padding: '6px 14px',
                        fontSize: '0.8125rem',
                    },
                    sizeLarge: {
                        padding: '14px 28px',
                        fontSize: '1rem',
                    },
                },
                defaultProps: {
                    disableElevation: false,
                },
            },
            // === CARDS ===
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '16px',
                        border: `1px solid ${colors.border.default}`,
                        backgroundColor: colors.background.paper,
                        backgroundImage: 'none',
                        boxShadow: isDark
                            ? '0 4px 24px rgba(0,0,0,0.4)'
                            : '0 4px 24px rgba(0,0,0,0.06)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                        },
                    },
                },
            },
            // === PAPER ===
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: colors.background.paper,
                    },
                    outlined: {
                        borderColor: colors.border.default,
                    },
                    elevation1: {
                        boxShadow: isDark
                            ? '0 2px 8px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(0,0,0,0.06)',
                    },
                },
            },
            // === CHIPS ===
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        fontWeight: 600,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    },
                    filled: {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                        },
                    },
                    outlined: {
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    },
                },
            },
            // === INPUTS ===
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                            transition: 'border-color 0.2s',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                        },
                    },
                },
            },
            // === DIALOGS & MODALS ===
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: '20px',
                        border: `1px solid ${colors.border.default}`,
                        backgroundImage: 'none',
                        boxShadow: isDark
                            ? '0 24px 80px rgba(0,0,0,0.6)'
                            : '0 24px 80px rgba(0,0,0,0.15)',
                    },
                },
            },
            // === MENUS ===
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: '12px',
                        border: `1px solid ${colors.border.default}`,
                        marginTop: '8px',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0,0,0,0.5)'
                            : '0 8px 32px rgba(0,0,0,0.12)',
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        margin: '4px 8px',
                        padding: '10px 16px',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        },
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.1)',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.15)',
                            },
                        },
                    },
                },
            },
            // === TABS ===
            MuiTab: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        minHeight: '44px',
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                    },
                },
            },
            // === TOOLTIPS ===
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: isDark ? '#252529' : '#1e293b',
                        color: '#f8fafc',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    },
                    arrow: {
                        color: isDark ? '#252529' : '#1e293b',
                    },
                },
            },
            // === DIVIDERS ===
            MuiDivider: {
                styleOverrides: {
                    root: {
                        borderColor: colors.border.subtle,
                    },
                },
            },
            // === LISTS ===
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        margin: '2px 0',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        },
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.12)',
                            },
                        },
                    },
                },
            },
            // === ICON BUTTONS ===
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                    },
                },
            },
            // === SWITCHES ===
            MuiSwitch: {
                styleOverrides: {
                    root: {
                        padding: 8,
                    },
                    track: {
                        borderRadius: 22 / 2,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
                    },
                },
            },
            // === LINEAR PROGRESS ===
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        borderRadius: '4px',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    },
                    bar: {
                        borderRadius: '4px',
                    },
                },
            },
            // === DRAWER ===
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: `1px solid ${colors.border.default}`,
                        backgroundImage: 'none',
                    },
                },
            },
            // === APP BAR ===
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark
                            ? 'rgba(13, 13, 15, 0.8)'
                            : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: `1px solid ${colors.border.subtle}`,
                        boxShadow: 'none',
                    },
                },
            },
            // === SKELETON ===
            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                },
            },
        },
    };
};

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));

export default createAppTheme;
