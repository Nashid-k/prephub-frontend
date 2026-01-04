import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { registerSW } from 'virtual:pwa-register';
import { initAnalytics } from './services/analytics';

// Only register Service Worker in Production to prevent reload loops in Dev
if (import.meta.env.PROD) {
    registerSW({ immediate: true });
}

// Initialize Google Analytics
initAnalytics();

// Highlight.js logic removed in favor of component-based highlighting in pages

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false, // Prevent refetching on window focus
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
