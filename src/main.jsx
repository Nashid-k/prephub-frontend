import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Initialize highlight.js globally
if (typeof window !== 'undefined' && window.hljs) {
    window.hljs.configure({
        languages: ['javascript', 'typescript', 'json', 'html', 'css', 'python', 'java', 'cpp', 'bash']
    });

    // Auto-highlight on DOM changes
    const observer = new MutationObserver(() => {
        document.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
            if (block.dataset.highlighted !== 'yes') {
                window.hljs.highlightElement(block);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial highlight
    setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
            if (block.dataset.highlighted !== 'yes') {
                window.hljs.highlightElement(block);
            }
        });
    }, 100);
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
