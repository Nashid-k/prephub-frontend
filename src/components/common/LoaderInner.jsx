import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useLoader } from '../../context/LoaderContext';

export default function LoaderInner() {
  const { activeCount, progress, eta, aiHint } = useLoader();

  const etaSec = Math.round(eta / 1000);
  return (
    <Box>
      <LinearProgress variant={activeCount ? 'determinate' : 'indeterminate'} value={progress} sx={{ height: 8, borderRadius: 6 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption">{activeCount ? `${activeCount} pending` : 'Preparing...'}</Typography>
        <Typography variant="caption">{activeCount && eta ? `≈ ${etaSec}s` : ''}</Typography>
      </Box>
      {aiHint && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>{aiHint}</Typography>
      )}
    </Box>
  );
}
