import React, { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Typography, useTheme, Tooltip } from '@mui/material';
import {
    ArrowBack,
    Menu as MenuIcon,
    Code,
    KeyboardArrowDown,
    Psychology,
    Bookmark,
    BookmarkBorder,
    Share,
    CheckCircle,
    CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { startTransition } from 'react';

/**
 * SectionHeader - Top navigation bar for the section page
 * Handles navigation, language switching, tools (quiz/bookmark), and mobile toggle
 */
const SectionHeader = ({
    topicSlug,
    categorySlug,
    categoryName,
    topicColor,
    isDark,
    sectionTitle,

    // Logic/State Props
    showLanguageSwitcher,
    selectedLanguage,
    onLanguageSelect,

    bookmarked,
    onToggleBookmark,

    isCompleted,
    onToggleComplete,

    onOpenQuiz,
    onMobileToggle
}) => {
    const navigate = useNavigate();
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

    const handleLanguageMenuOpen = (event) => {
        setLanguageMenuAnchor(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setLanguageMenuAnchor(null);
    };

    const handleLanguageClick = (langCode) => {
        onLanguageSelect(langCode);
        handleLanguageMenuClose();
    };

    // Glass effect style for menu
    const glassSx = {
        background: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
    };

    const availableLanguages = [
        { code: 'javascript', label: 'JavaScript' },
        { code: 'python', label: 'Python' },
        { code: 'java', label: 'Java' },
        { code: 'cpp', label: 'C++' },
        { code: 'csharp', label: 'C#' },
        { code: 'go', label: 'Go' },
        { code: 'rust', label: 'Rust' }
    ];

    return (
        <Box
            component="header"
            sx={{
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 10
            }}
        >
            {/* Left: Navigation & Mobile Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => startTransition(() => navigate(`/topic/${topicSlug}/category/${categorySlug}`))}
                    sx={{
                        borderRadius: '9999px',
                        px: { xs: 1.5, md: 3 },
                        py: 1,
                        minWidth: 'auto',
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                        color: 'text.primary',
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            background: `${topicColor}20`,
                            borderColor: topicColor,
                            color: topicColor,
                            transform: 'translateX(-4px)'
                        },
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Back to {categoryName || 'Category'}
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, fontWeight: 600 }}>
                        Back
                    </Box>
                </Button>

                <IconButton
                    onClick={onMobileToggle}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        color: 'text.primary',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Right: Tools (Lang, Quiz, Bookmark) */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Language Switcher */}
                {showLanguageSwitcher && (
                    <>
                        <Button
                            onClick={handleLanguageMenuOpen}
                            sx={{
                                borderRadius: '12px',
                                px: 2,
                                py: 1,
                                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: 'divider',
                                color: 'text.primary',
                                textTransform: 'none',
                                '&:hover': {
                                    background: `${topicColor}15`,
                                    borderColor: topicColor
                                }
                            }}
                        >
                            <Code sx={{ mr: 1, fontSize: '1.2rem', color: topicColor }} />
                            <Typography variant="body2" fontWeight={600}>
                                {selectedLanguage ? selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1) : 'JS'}
                            </Typography>
                            <KeyboardArrowDown sx={{ ml: 0.5, opacity: 0.7 }} />
                        </Button>
                        <Menu
                            anchorEl={languageMenuAnchor}
                            open={Boolean(languageMenuAnchor)}
                            onClose={handleLanguageMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 3,
                                    minWidth: 180,
                                    overflow: 'hidden',
                                    ...glassSx
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid divider' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                    TRANSLATE TO
                                </Typography>
                            </Box>
                            {availableLanguages.map((lang) => (
                                <MenuItem
                                    key={lang.code}
                                    onClick={() => handleLanguageClick(lang.code)}
                                    selected={selectedLanguage === lang.code}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        '&.Mui-selected': {
                                            bgcolor: `${topicColor}15`,
                                            color: topicColor,
                                            fontWeight: 700
                                        },
                                        '&:hover': {
                                            bgcolor: `${topicColor}08`
                                        }
                                    }}
                                >
                                    {lang.label}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}

                {/* Quiz Button */}
                <Tooltip title="Test your knowledge">
                    <Button
                        onClick={() => startTransition(onOpenQuiz)}
                        sx={{
                            borderRadius: '12px',
                            minWidth: 'auto',
                            px: 2,
                            background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' : 'white',
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.primary',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${topicColor}40`,
                                borderColor: topicColor
                            }
                        }}
                    >
                        <Psychology sx={{ mr: { xs: 0, sm: 1 }, color: '#ec4899' }} /> {/* Pink brain icon */}
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 600 }}>
                            Quiz
                        </Box>
                    </Button>
                </Tooltip>

                {/* Mark Complete Button */}
                <Tooltip title={isCompleted ? "Completed" : "Mark as Complete"}>
                    <IconButton
                        onClick={() => startTransition(onToggleComplete)}
                        sx={{
                            color: isCompleted ? '#22c55e' : 'text.secondary', // Green if completed
                            bgcolor: isCompleted ? 'rgba(34, 197, 94, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'white'),
                            border: '1px solid',
                            borderColor: isCompleted ? '#22c55e' : 'divider',
                            borderRadius: '12px',
                            width: 42,
                            height: 42,
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                bgcolor: isCompleted ? 'rgba(34, 197, 94, 0.25)' : 'action.hover'
                            }
                        }}
                    >
                        {isCompleted ? <CheckCircle /> : <CheckCircleOutline />}
                    </IconButton>
                </Tooltip>

                {/* Bookmark Toggle */}
                <Tooltip title={bookmarked ? "Remove Bookmark" : "Save for later"}>
                    <IconButton
                        onClick={() => startTransition(onToggleBookmark)}
                        sx={{
                            color: bookmarked ? topicColor : 'text.secondary',
                            bgcolor: bookmarked ? `${topicColor}15` : (isDark ? 'rgba(255,255,255,0.05)' : 'white'),
                            border: '1px solid',
                            borderColor: bookmarked ? topicColor : 'divider',
                            borderRadius: '12px',
                            width: 42,
                            height: 42,
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                bgcolor: bookmarked ? `${topicColor}25` : 'action.hover'
                            }
                        }}
                    >
                        {bookmarked ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default SectionHeader;
