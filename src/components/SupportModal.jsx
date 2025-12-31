import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton,
    Button,
    useTheme as useMuiTheme,
    Tooltip
} from '@mui/material';
import { Close, ContentCopy, CheckCircle, LocalCafe } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const SupportModal = ({ open, onClose }) => {
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const [copied, setCopied] = React.useState(false);

    // Actual UPI ID
    const UPI_ID = 'nashidk1999-1@okicici';

    const handleCopy = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        toast.success('UPI ID copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            // ... (rest of Dialog props same as original file content, skipping to maintain context)
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    background: isDark
                        ? 'linear-gradient(135deg, #1e1e1e 0%, #0d0d0d 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    maxWidth: '400px',
                    width: '100%',
                    p: 1
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <Close />
                </IconButton>

                <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#ffd100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            boxShadow: '0 8px 24px rgba(255, 209, 0, 0.3)'
                        }}
                    >
                        <LocalCafe sx={{ fontSize: 32, color: 'black' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                        Support My Work
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 4 }}
                    >
                        If you found PrepHub helpful, consider buying me a coffee! Your support helps keep the server running.
                    </Typography>

                    {/* UPI ID Box */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: '1px dashed',
                            borderColor: theme.palette.divider,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                UPI ID (Google Pay / PhonePe)
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                {UPI_ID}
                            </Typography>
                        </Box>
                        <Tooltip title={copied ? "Copied!" : "Copy UPI ID"}>
                            <IconButton onClick={handleCopy} color={copied ? "success" : "default"}>
                                {copied ? <CheckCircle /> : <ContentCopy />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* QR Code */}
                    <Box
                        sx={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: '16px',
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 2,
                            overflow: 'hidden',
                            p: 2
                        }}
                    >
                        <img
                            src="/payment-qr.jpg"
                            alt="Payment QR Code"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            borderRadius: '9999px',
                            py: 1.5,
                            mt: 2,
                            background: 'linear-gradient(135deg, #5e5ce6 0%, #7d7bf0 100%)'
                        }}
                    >
                        Close
                    </Button>
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default SupportModal;
