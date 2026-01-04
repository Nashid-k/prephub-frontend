import React from 'react';
import { FormControl, Select, MenuItem, Box, Typography, Chip } from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ size = 'medium', variant = 'outlined', showLabel = true }) => {
    const { selectedLanguage, setSelectedLanguage, supportedLanguages } = useLanguage();

    const handleChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    return (
        <FormControl size={size} variant={variant} sx={{ minWidth: 180 }}>
            {showLabel && (
                <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Language
                </Typography>
            )}
            <Select
                value={selectedLanguage}
                onChange={handleChange}
                displayEmpty
                sx={{
                    '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }
                }}
            >
                {supportedLanguages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '1.2rem' }}>{lang.icon}</span>
                            <Typography>{lang.label}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;
