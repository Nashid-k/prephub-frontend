import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Container,
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme as useMuiTheme,
} from '@mui/material';
import {
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    Bookmark as BookmarkIcon,
    TrendingUp as ProgressIcon,
    Search as SearchIcon,
    LightMode,
    DarkMode,
    Menu as MenuIcon,
    Close as CloseIcon,
    Logout,
    School,
    LocalCafe,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const [showSearch, setShowSearch] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navItems = [
        { path: '/', label: 'Home', icon: <HomeIcon /> },
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
        { path: '/progress', label: 'Progress', icon: <ProgressIcon /> }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleUserMenuClose();
        logout();
        navigate('/');
    };

    const drawer = (
        <Box sx={{ width: 280, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ fontSize: 32, color: '#5e5ce6' }} />
                    <Box sx={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        PrepHub
                    </Box>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 1 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            onClick={handleDrawerToggle}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: '9999px',
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #d070ff 0%, #b865ff 100%)',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'transparent',
                    boxShadow: 'none',
                    borderBottom: 'none',
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ py: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.08)'
                                        : 'rgba(0, 0, 0, 0.06)',
                                borderRadius: '9999px',
                                px: { xs: 2, md: 3 },
                                py: 1.5,
                                boxShadow: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                            }}
                        >
                            <Box
                                component={Link}
                                to="/"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    textDecoration: 'none',
                                    flexShrink: 0,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(94, 92, 230, 0.4)',
                                    }}
                                >
                                    <School sx={{ fontSize: 24, color: 'white' }} />
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        display: { xs: 'none', sm: 'block' },
                                    }}
                                >
                                    PrepHub
                                </Box>
                            </Box>

                            {!isMobile && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 0.5,
                                        background: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.03)',
                                        borderRadius: '9999px',
                                        p: 0.5,
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                    }}
                                >
                                    {navItems.map((item) => (
                                        <Button
                                            key={item.path}
                                            component={Link}
                                            to={item.path}
                                            startIcon={item.icon}
                                            variant={location.pathname === item.path ? 'contained' : 'text'}
                                            size="small"
                                            sx={{
                                                borderRadius: '9999px',
                                                px: 2,
                                                py: 0.75,
                                                minWidth: 'auto',
                                                color: location.pathname === item.path ? 'white' : 'text.primary',
                                                background: location.pathname === item.path
                                                    ? 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)'
                                                    : 'transparent',
                                                boxShadow: location.pathname === item.path
                                                    ? '0 4px 12px rgba(94, 92, 230, 0.4)'
                                                    : 'none',
                                                '&:hover': {
                                                    background: location.pathname === item.path
                                                        ? 'linear-gradient(135deg, #d070ff 0%, #b865ff 100%)'
                                                        : 'rgba(94, 92, 230, 0.1)',
                                                    transform: 'scale(1.05)',
                                                },
                                                transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    ))}
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                <IconButton
                                    component="a"
                                    href="https://buymeacoffee.com/shadowishere"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(0, 0, 0, 0.06)',
                                        color: '#ffd100',
                                        '&:hover': {
                                            bgcolor: '#ffd100',
                                            color: 'black',
                                            transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                    title="Buy me a coffee"
                                >
                                    <LocalCafe fontSize="small" />
                                </IconButton>

                                <IconButton
                                    onClick={() => setShowSearch(true)}
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(0, 0, 0, 0.06)',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                    title="Search (Ctrl+K)"
                                >
                                    <SearchIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                    onClick={toggleTheme}
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(0, 0, 0, 0.06)',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            transform: 'rotate(180deg) scale(1.1)',
                                        },
                                        transition: 'all 0.4s',
                                    }}
                                    aria-label="Toggle Theme"
                                >
                                    {theme === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                                </IconButton>

                                {user ? (
                                    <>
                                        <IconButton
                                            id="navbar-profile"
                                            onClick={handleUserMenuOpen}
                                            sx={{ p: 0 }}
                                        >
                                            {user.picture ? (
                                                <Avatar
                                                    src={user.picture}
                                                    alt={user.name}
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        border: '2px solid',
                                                        borderColor: 'primary.main',
                                                    }}
                                                />
                                            ) : (
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: 'primary.main',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    {user.name.charAt(0)}
                                                </Avatar>
                                            )}
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleUserMenuClose}
                                            PaperProps={{
                                                sx: {
                                                    borderRadius: '20px',
                                                    mt: 1,
                                                    minWidth: 200,
                                                    background: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(30, 30, 30, 0.95)'
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid',
                                                    borderColor: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                                                },
                                            }}
                                        >
                                            <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
                                                {user.name}
                                            </MenuItem>
                                            <MenuItem
                                                onClick={handleLogout}
                                                sx={{
                                                    color: 'error.main',
                                                    borderRadius: '12px',
                                                    mx: 1,
                                                    '&:hover': {
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                    },
                                                }}
                                            >
                                                <Logout sx={{ mr: 1, fontSize: 20 }} />
                                                Logout
                                            </MenuItem>
                                        </Menu>
                                    </>
                                ) : (
                                    <Button
                                        component={Link}
                                        to="/login"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 2.5,
                                            py: 0.75,
                                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)',
                                            boxShadow: '0 4px 12px rgba(94, 92, 230, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #d070ff 0%, #b865ff 100%)',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Login
                                    </Button>
                                )}

                                {isMobile && (
                                    <IconButton
                                        onClick={handleDrawerToggle}
                                        size="small"
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                    : 'rgba(0, 0, 0, 0.06)',
                                        }}
                                    >
                                        <MenuIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '24px',
                        borderBottomLeftRadius: '24px',
                    },
                }}
            >
                {drawer}
            </Drawer >

            {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
        </>
    );
};

export default Navbar;
