import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoaderProvider } from '../../../context/LoaderContext';
import LoaderInner from '../LoaderInner';
import tracker from '../../../utils/requestTracker';

test('shows ETA, progress and AI hint during slow request', async () => {
  // start a request that will remain inflight for the duration of the test
  const id = tracker.startRequest({ url: '/ai/generate', method: 'POST' });

  render(
    <LoaderProvider>
      <LoaderInner />
    </LoaderProvider>
  );

  // pending count should show (findByText will throw if not found)
  await screen.findByText(/1 pending/i);

  // ETA should be shown in seconds (≈ Ns)
  expect(screen.getByText(/≈\s*\d+s/)).toBeDefined();

  // AI hint heuristics should provide an ai-style message
  expect(screen.getByText(/Thinking like an expert tutor/i)).toBeDefined();

  // finish the request
  tracker.endRequest(id);
});
