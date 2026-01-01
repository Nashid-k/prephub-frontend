import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker
registerSW({ immediate: true });

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
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
