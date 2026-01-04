import React from 'react';
import {
    Box,
    Drawer,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    IconButton,
    useTheme
} from '@mui/material';
import {
    CheckCircle,
    RadioButtonUnchecked,
    Lock,
    Close
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * SectionNavigation - The drawer list of sections in the current topic/category
 * Replaces the inline drawer logic in SectionPage
 */
const SectionNavigation = ({
    mobileOpen,
    onMobileClose,
    sections = [],
    currentIndex,
    topicSlug,
    categorySlug,
    topicColor,
    isDark,
    progressMap = {}
}) => {
    const theme = useTheme();

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
        }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700} className="gradient-text">
                    Curriculum
                </Typography>
                <IconButton onClick={onMobileClose} sx={{ display: { md: 'none' } }}>
                    <Close />
                </IconButton>
            </Box>

            <List sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
                {sections.map((sec, idx) => {
                    const isCompleted = progressMap[sec.slug];
                    const isActive = idx === currentIndex;
                    // const isLocked = idx > currentIndex + 1 && !isCompleted; // Strict sequential
                    const isLocked = false; // Relaxed for now

                    return (
                        <ListItemButton
                            key={sec._id}
                            component={Link}
                            to={`/topic/${topicSlug}/${categorySlug}/${sec.slug}`}
                            selected={isActive}
                            disabled={isLocked}
                            onClick={onMobileClose}
                            sx={{
                                mb: 1,
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: isActive ? `${topicColor}40` : 'transparent',
                                bgcolor: isActive ? `${topicColor}10` : 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: isActive ? `${topicColor}15` : 'action.hover',
                                    transform: 'translateX(4px)'
                                },
                                '&.Mui-selected': {
                                    bgcolor: `${topicColor}15`,
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                {isLocked ? (
                                    <Lock sx={{ fontSize: 18, color: 'text.disabled' }} />
                                ) : isCompleted ? (
                                    <CheckCircle sx={{ fontSize: 20, color: '#4ade80' }} /> // Green for done
                                ) : (
                                    <RadioButtonUnchecked sx={{ fontSize: 20, color: isActive ? topicColor : 'text.disabled' }} />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={sec.title}
                                primaryTypographyProps={{
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? topicColor : 'text.primary'
                                }}
                                secondary={sec.estimatedMinutes ? `${sec.estimatedMinutes} min` : null}
                                secondaryTypographyProps={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Progress</Typography>
                    <Typography variant="caption" fontWeight={700}>
                        {Math.round((Object.values(progressMap).filter(Boolean).length / sections.length) * 100) || 0}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={(Object.values(progressMap).filter(Boolean).length / sections.length) * 100 || 0}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: topicColor,
                            borderRadius: 3
                        }
                    }}
                />
            </Box>
        </Box>
    );

    return (
        <Box component="nav">
            {/* Desktop persistent drawer can be implemented if layout changes, 
                for now we only use this as the mobile/temporary drawer component */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile
                sx={{
                    display: { xs: 'block', md: 'none' }, // Only mobile for now, purely temporary
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                        borderRight: 'none',
                        background: 'transparent',
                        boxShadow: 'none'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* We could also export desktop version logic here if SectionPage layout supports it */}
        </Box>
    );
};

export default SectionNavigation;
