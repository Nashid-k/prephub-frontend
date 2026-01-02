import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Chip,
    Divider,
} from '@mui/material';
import { Close, Keyboard } from '@mui/icons-material';

const KeyboardShortcutsHelp = ({ open, onClose }) => {
    const shortcuts = [
        {
            category: 'Navigation',
            items: [
                { keys: ['Ctrl', 'K'], description: 'Open search' },
                { keys: ['N'], description: 'Next section' },
                { keys: ['P'], description: 'Previous section' },
                { keys: ['Esc'], description: 'Close modals' },
            ],
        },
        {
            category: 'Actions',
            items: [
                { keys: ['B'], description: 'Toggle bookmark' },
                { keys: ['M'], description: 'Mark section complete/incomplete' },
                { keys: ['Ctrl', 'S'], description: 'Save/Run code (in editor)' },
            ],
        },
        {
            category: 'General',
            items: [
                { keys: ['?'], description: 'Show this help dialog' },
                { keys: ['Ctrl', '/'], description: 'Toggle theme' },
            ],
        },
    ];

    const KeyChip = ({ keyName }) => (
        <Chip
            label={keyName}
            size="small"
            sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                minWidth: '40px',
                background: theme => theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
            }}
        />
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Keyboard />
                <Typography variant="h6" sx={{ flex: 1 }}>
                    Keyboard Shortcuts
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {shortcuts.map((section, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 2,
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                opacity: 0.7,
                            }}
                        >
                            {section.category}
                        </Typography>

                        {section.items.map((item, itemIdx) => (
                            <Box
                                key={itemIdx}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    borderBottom: itemIdx < section.items.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="body2">
                                    {item.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {item.keys.map((key, keyIdx) => (
                                        <React.Fragment key={keyIdx}>
                                            <KeyChip keyName={key} />
                                            {keyIdx < item.keys.length - 1 && (
                                                <Typography variant="body2" sx={{ mx: 0.5 }}>
                                                    +
                                                </Typography>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </Box>
                        ))}

                        {idx < shortcuts.length - 1 && <Divider sx={{ mt: 3 }} />}
                    </Box>
                ))}
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(KeyboardShortcutsHelp);
