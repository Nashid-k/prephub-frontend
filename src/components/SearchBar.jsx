import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    Button,
    Typography,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Close, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import './SearchBar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    // Fetch suggestions for autocomplete
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/suggestions`, {
                    params: { query }
                });
                setSuggestions(response.data.suggestions || []);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Search function
    const handleSearch = async (e) => {
        e?.preventDefault();

        if (query.trim().length < 2) {
            toast.error('Please enter at least 2 characters');
            return;
        }

        setLoading(true);
        setShowResults(true);

        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: {
                    query: query.trim(),
                    difficulty: selectedDifficulty,
                    limit: 20
                }
            });

            setResults(response.data);

            if (response.data.total === 0) {
                toast('No results found', { icon: '🔍' });
            }
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed. Please try again.');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Navigate to result
    const handleResultClick = (result) => {
        if (result.type === 'topic') {
            navigate(`/topic/${result.slug}`);
        } else if (result.type === 'category') {
            navigate(`/topic/${result.topicId.slug}/category/${result.slug}`);
        } else if (result.type === 'section') {
            navigate(`/topic/${result.topicId.slug}/category/${result.categoryId.slug}/section/${result.slug}`);
        }
        onClose?.();
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.text);
        setSuggestions([]);
        handleSearch();
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '32px',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.06)',
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 24px 64px rgba(0, 0, 0, 0.6)'
                            : '0 24px 64px rgba(0, 0, 0, 0.15)',
                    maxHeight: '80vh',
                },
            }}
        >
            <Box sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Search PrepHub
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            borderRadius: '50%',
                            bgcolor: 'action.hover',
                            '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                            },
                        }}
                    >
                        <Close />
                    </IconButton>
                </Box>

                {/* Search Form */}
                <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search topics, sections, or concepts..."
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                            endAdornment: query && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setQuery('');
                                            setResults(null);
                                            setSuggestions([]);
                                            setShowResults(false);
                                        }}
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: '9999px',
                                bgcolor: 'action.hover',
                                '& fieldset': { border: 'none' },
                            },
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* Filters */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            displayEmpty
                            size="small"
                            sx={{
                                borderRadius: '9999px',
                                minWidth: 180,
                                bgcolor: 'action.hover',
                                '& fieldset': { border: 'none' },
                            }}
                        >
                            <MenuItem value="">All Difficulties</MenuItem>
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                        </Select>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                            sx={{
                                borderRadius: '9999px',
                                px: 3,
                                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #409cff 0%, #7d7bf0 100%)',
                                },
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </Box>
                </Box>

                {/* Autocomplete Suggestions */}
                {suggestions.length > 0 && !showResults && (
                    <Box sx={{ mb: 2 }}>
                        {suggestions.map((suggestion, index) => (
                            <Box
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: '16px',
                                    bgcolor: 'action.hover',
                                    mb: 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'action.selected',
                                        transform: 'translateX(8px)',
                                    },
                                }}
                            >
                                <Typography sx={{ fontSize: '1.2rem' }}>
                                    {suggestion.type === 'topic' ? '📚' : '📄'}
                                </Typography>
                                <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                                    {suggestion.text}
                                </Typography>
                                <Chip
                                    label={suggestion.type}
                                    size="small"
                                    sx={{
                                        borderRadius: '9999px',
                                        textTransform: 'capitalize',
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Search Results */}
                {showResults && results && (
                    <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Results ({results.total})
                            </Typography>
                            <IconButton size="small" onClick={() => setShowResults(false)}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>

                        {results.total === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No results found for "{query}"
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try different keywords or check your spelling
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {/* Topics */}
                                {results.topics?.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                                            📚 Topics ({results.topics.length})
                                        </Typography>
                                        {results.topics.map((topic) => (
                                            <Box
                                                key={topic._id}
                                                onClick={() => handleResultClick(topic)}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    bgcolor: 'action.hover',
                                                    mb: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        transform: 'translateX(8px)',
                                                    },
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {topic.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                    {topic.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Categories */}
                                {results.categories?.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                                            📑 Categories ({results.categories.length})
                                        </Typography>
                                        {results.categories.map((category) => (
                                            <Box
                                                key={category._id}
                                                onClick={() => handleResultClick(category)}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    bgcolor: 'action.hover',
                                                    mb: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        transform: 'translateX(8px)',
                                                    },
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {category.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                    {category.topicId?.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                    {category.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Sections */}
                                {results.sections?.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                                            📄 Sections ({results.sections.length})
                                        </Typography>
                                        {results.sections.map((section) => (
                                            <Box
                                                key={section._id}
                                                onClick={() => handleResultClick(section)}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '16px',
                                                    bgcolor: 'action.hover',
                                                    mb: 1,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        transform: 'translateX(8px)',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                                        {section.title}
                                                    </Typography>
                                                    <Chip
                                                        label={section.difficulty}
                                                        size="small"
                                                        color={
                                                            section.difficulty === 'beginner' ? 'success' :
                                                                section.difficulty === 'intermediate' ? 'warning' : 'error'
                                                        }
                                                        sx={{ borderRadius: '9999px', fontSize: '0.7rem' }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                    {section.topicId?.title} → {section.categoryId?.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                                                    {section.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </Box>
        </Dialog>
    );
};

export default SearchBar;
