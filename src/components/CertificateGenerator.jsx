import React from 'react';
import { Dialog, DialogContent, DialogTitle, Button, Box, Typography } from '@mui/material';
import { Download, Close, Share } from '@mui/icons-material';

/**
 * Certificate Generator Component
 * Generates beautiful completion certificates using Canvas API
 */
const CertificateGenerator = ({ open, onClose, userName, topicName, completionDate, stats }) => {
    const canvasRef = React.useRef(null);
    const [certificateUrl, setCertificateUrl] = React.useState(null);

    React.useEffect(() => {
        if (open && userName && topicName) {
            generateCertificate();
        }
    }, [open, userName, topicName]);

    const generateCertificate = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
        gradient.addColorStop(0, '#5e5ce6');
        gradient.addColorStop(1, '#0a84ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 800);

        // White card overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(100, 100, 1000, 600);

        // Border
        ctx.strokeStyle = '#5e5ce6';
        ctx.lineWidth = 8;
        ctx.strokeRect(100, 100, 1000, 600);

        // Certificate header
        ctx.fillStyle = '#5e5ce6';
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', 600, 220);

        // Subtitle
        ctx.fillStyle = '#666';
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText('PrepHub - MERN Stack Learning Platform', 600, 260);

        // Presented to
        ctx.fillStyle = '#333';
        ctx.font = '28px Inter, sans-serif';
        ctx.fillText('This is to certify that', 600, 340);

        // User name
        ctx.fillStyle = '#0a84ff';
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillText(userName, 600, 400);

        // Completion text
        ctx.fillStyle = '#333';
        ctx.font = '28px Inter, sans-serif';
        ctx.fillText(`has successfully completed`, 600, 460);

        // Topic name
        ctx.fillStyle = '#5e5ce6';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.fillText(topicName, 600, 510);

        // Stats
        if (stats) {
            ctx.fillStyle = '#666';
            ctx.font = '20px Inter, sans-serif';
            const statsText = `${stats.sectionsCompleted} sections • ${stats.hoursStudied} hours studied`;
            ctx.fillText(statsText, 600, 560);
        }

        // Date
        ctx.fillStyle = '#999';
        ctx.font = '22px Inter, sans-serif';
        ctx.fillText(completionDate || new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), 600, 620);

        // PrepHub branding
        ctx.fillStyle = '#5e5ce6';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillText('PrepHub', 600, 670);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        setCertificateUrl(dataUrl);
    };

    const handleDownload = () => {
        if (!certificateUrl) return;

        const link = document.createElement('a');
        link.download = `${topicName.replace(/\s+/g, '_')}_Certificate.png`;
        link.href = certificateUrl;
        link.click();
    };

    const handleShare = async () => {
        if (!certificateUrl) return;

        if (navigator.share) {
            try {
                const blob = await (await fetch(certificateUrl)).blob();
                const file = new File([blob], 'certificate.png', { type: 'image/png' });
                await navigator.share({
                    title: `${topicName} Completion Certificate`,
                    text: `I just completed ${topicName} on PrepHub! 🎉`,
                    files: [file]
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            // Fallback: copy link
            handleDownload();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    🎉 Congratulations!
                </Typography>
                <Button onClick={onClose} sx={{ minWidth: 'auto' }}>
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent>
                {certificateUrl && (
                    <Box>
                        <Box
                            component="img"
                            src={certificateUrl}
                            alt="Certificate"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 2,
                                boxShadow: 3,
                                mb: 3
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{ borderRadius: '20px', px: 3 }}
                            >
                                Download Certificate
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Share />}
                                onClick={handleShare}
                                sx={{ borderRadius: '20px', px: 3 }}
                            >
                                Share
                            </Button>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Share your achievement on LinkedIn with #PrepHub #MERN
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CertificateGenerator;
