import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box, Chip } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
    const location = useLocation();

    if (!items || items.length === 0) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <MuiBreadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        color: 'text.secondary',
                    },
                }}
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isHome = item.path === '/dashboard' || item.path === '/';

                    if (isLast) {
                        return (
                            <Chip
                                key={index}
                                label={item.label}
                                icon={isHome ? <Home sx={{ fontSize: 18 }} /> : undefined}
                                sx={{
                                    borderRadius: '9999px',
                                    fontWeight: 600,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    height: '32px',
                                    '& .MuiChip-icon': {
                                        color: 'white',
                                    },
                                }}
                            />
                        );
                    }

                    return (
                        <Chip
                            key={index}
                            component={Link}
                            to={item.path}
                            label={item.label}
                            icon={isHome ? <Home sx={{ fontSize: 18 }} /> : undefined}
                            clickable
                            sx={{
                                borderRadius: '9999px',
                                fontWeight: 500,
                                bgcolor: 'action.hover',
                                height: '32px',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'action.selected',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                    );
                })}
            </MuiBreadcrumbs>
        </Box>
    );
};

export default Breadcrumb;
