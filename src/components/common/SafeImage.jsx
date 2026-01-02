import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

const SafeImage = ({
    src,
    alt,
    fallback = '/images/topics/dsa.svg',
    height = '100%',
    width = '100%',
    objectFit = 'contain',
    className = '',
    sx = {}
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <Box sx={{ position: 'relative', width, height, ...sx }} className={className}>
            {loading && !error && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ position: 'absolute', top: 0, left: 0, borderRadius: 'inherit' }}
                />
            )}
            <img
                src={error ? fallback : src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: objectFit,
                    display: loading && !error ? 'none' : 'block',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: loading ? 0 : 1
                }}
            />
        </Box>
    );
};

export default React.memo(SafeImage);
