import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Share } from '@mui/icons-material';
import LZString from 'lz-string';
import toast from 'react-hot-toast';

const ShareButton = ({ code, language = 'javascript' }) => {
    const handleShare = () => {
        try {
            const compressed = LZString.compressToEncodedURIComponent(code);
            const shareUrl = `${window.location.origin}/share?code=${compressed}&lang=${language}`;

            if (shareUrl.length > 2000) {
                toast.error('Code is too long to share via URL. Try shortening it.');
                return;
            }

            navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            console.error('Error sharing code:', error);
            toast.error('Failed to create share link');
        }
    };

    return (
        <Tooltip title="Share this code via link" arrow>
            <Button
                variant="outlined"
                size="small"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                }}
            >
                Share Code
            </Button>
        </Tooltip>
    );
};

export default React.memo(ShareButton);
